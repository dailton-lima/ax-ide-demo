/* Comunicação com o Hub EVORA por Wi-Fi ou REPL serial USB. */
(function () {
  const hubUrl = () => address.value.replace(/\/$/, '');
  const baseManifest = axiomaManifest;
  let hubDescriptor = null;
  const capabilityByBlock = Object.freeze({
    axioma_motor_speed: 'motor.dc.open_loop.4', axioma_motor_stop: 'motor.dc.open_loop.4', axioma_stop_all: 'motor.dc.open_loop.4', axioma_robot_move: 'motor.dc.open_loop.4', axioma_robot_turn: 'motor.dc.open_loop.4', axioma_robot_stop: 'motor.dc.open_loop.4', axioma_servo_angle: 'servo.position.2', axioma_touch: 'sensor.port.6', axioma_analog: 'sensor.port.6', axioma_line_value: 'sensor.port.6', axioma_light_value: 'sensor.port.6', axioma_pot_value: 'sensor.port.6', axioma_color_is: 'sensor.port.6', axioma_reflected_light: 'sensor.port.6', axioma_accel: 'imu.6axis', axioma_gyro: 'imu.6axis', axioma_imu_tilted: 'imu.6axis', axioma_imu_yaw: 'imu.6axis', axioma_tone: 'audio.pcm', axioma_play_wav: 'audio.pcm', axioma_show_image: 'display.rgb.240x240', axioma_clear_display: 'display.rgb.240x240'
  });

  function requiredCapabilities() {
    const required = new Set();
    workspace?.getAllBlocks(false).forEach(block => { const capability = capabilityByBlock[block.type]; if (capability) required.add(capability); });
    if (project()?.config?.some(type => type !== 'none')) required.add('sensor.port.6');
    return [...required].sort();
  }

  function manifestForHub(packageInfo = null) {
    const manifest = baseManifest(); const target = manifest.target || {};
    manifest.target = { ...target, profile: AXIOMA_HARDWARE_PROFILE.id, profile_version: AXIOMA_HARDWARE_PROFILE.version, requires: [...new Set([...(target.requires || []), ...requiredCapabilities()])].sort() };
    if (packageInfo) manifest.package = packageInfo;
    return manifest;
  }

  async function hashInfo(bytes) {
    if (!crypto?.subtle) throw Error('Este navegador não oferece SHA-256 para validar o envio.');
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    const sha256 = [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
    return { size: bytes.byteLength, sha256 };
  }

  async function packageInfo(text) {
    const assetsFor = async files => Promise.all([...files].map(async ([name, data]) => ({ name, ...(await hashInfo(data)) })));
    return {
      format: 'axioma-project-v1', entry: await hashInfo(new TextEncoder().encode(text)),
      assets: { audio: await assetsFor(audio), images: await assetsFor(images) }
    };
  }

  const rawUsbUpload = axiomaUsbUpload;
  async function uploadUsb(text, manifest) {
    const manifestBeforeUpload = axiomaManifest;
    axiomaManifest = () => manifest;
    try { await rawUsbUpload(text); } finally { axiomaManifest = manifestBeforeUpload; }
  }

  function verifyCompatibility() {
    if (!hubDescriptor) return;
    if (hubDescriptor.id !== AXIOMA_HARDWARE_PROFILE.id) throw Error('Este projeto é destinado ao Hub EVORA Base.');
    if (Number(hubDescriptor.version) < Number(AXIOMA_HARDWARE_PROFILE.version)) throw Error('Atualize o firmware do hub antes de enviar este projeto.');
    const missing = requiredCapabilities().find(capability => !(hubDescriptor.capabilities || []).includes(capability));
    if (missing) throw Error('O firmware conectado não oferece: ' + missing + '.');
  }

  async function request(path, options = {}) {
    const response = await fetch(hubUrl() + path, { signal: AbortSignal.timeout(6000), ...options });
    if (!response.ok) throw Error(await response.text() || 'Falha no hub');
    return response;
  }

  async function refresh() {
    try {
      const data = await (await request('/api/status')).json();
      hubDescriptor = data.hardware || null;
      dot.classList.add('ok');
      deviceText.textContent = data.name + ' · ' + (data.battery ?? '—') + '%';
      blockName.value = data.name || '';
      wifiName.value = data.wifi_name || data.name || '';
      battery.value = data.battery == null ? '—' : data.battery + '%';
      connectionNotice.textContent = 'Wi-Fi conectado. A configuração e o envio estão disponíveis.';
    } catch {
      dot.classList.remove('ok');
      deviceText.textContent = 'Bloco não conectado';
      connectionNotice.textContent = 'Por Wi-Fi, conecte-se à rede do bloco. Por cabo USB, não use senha.';
    }
  }

  function updateMode() {
    const cable = connectionMode.value === 'cable';
    passwordWrap.classList.toggle('hidden', cable);
    connectionNotice.textContent = cable
      ? 'Cabo USB: acesso direto, sem senha. Use o armazenamento USB do bloco para transferir projetos.'
      : 'Wi-Fi: conecte-se à rede do bloco.';
  }

  async function saveHubSettings() {
    try {
      await request('/api/config', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: blockName.value, wifi_name: wifiName.value, wifi_password: wifiPassword.value })
      });
      deviceStatus.textContent = 'Configuração salva.';
      refresh();
    } catch (error) { deviceStatus.textContent = error.message; }
  }

  async function formatHub() {
    if (!confirm('Formatar a memória remove todos os projetos, áudios e imagens do bloco.')) return;
    try {
      await request('/api/format', { method: 'POST' });
      deviceStatus.textContent = 'Memória formatada.';
    } catch (error) { deviceStatus.textContent = error.message; }
  }

  async function sendProject() {
    const preflight = window.axPreflight?.review();
    if (preflight?.errors?.length) {
      status.textContent = 'Revise o projeto antes do envio: ' + preflight.errors[0];
      return;
    }
    const text = generate(true);
    if (!text) return;
    send.disabled = true;
    try {
      verifyCompatibility();
      const manifest = manifestForHub(await packageInfo(text));
      if (window.axMultiHub?.enabled()) {
        const deployment = window.axMultiHub.deploymentPayload(manifest);
        const report = await (await request('/api/hubs/deploy', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(deployment)
        })).json();
        status.textContent = 'Implantação CAN iniciada · ' + report.remote_hubs.length + ' hub(s) aguardando confirmação';
        status.classList.add('ok');
        return;
      }
      if (connectionMode.value === 'cable') {
        await uploadUsb(text, manifest);
      } else {
        await request('/upload', {
          method: 'POST', headers: { 'Content-Type': 'text/plain', 'X-Axioma-Project': asset(project().name) }, body: text
        });
        for (const [name, data] of audio) await request('/assets/audio/' + encodeURIComponent(name) + '.wav', { method: 'POST', headers: { 'Content-Type': 'audio/wav' }, body: data });
        for (const [name, data] of images) await request('/assets/images/' + encodeURIComponent(name) + '.rgb565', { method: 'POST', headers: { 'Content-Type': 'application/octet-stream' }, body: data });
        await request('/api/projects/' + encodeURIComponent(asset(project().name)) + '/manifest', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(manifest)
        });
      }
      status.textContent = 'Projeto enviado ao hub';
      status.classList.add('ok');
    } catch (error) {
      status.textContent = 'Envio não concluído: ' + error.message;
    } finally { send.disabled = false; }
  }

  async function startMultiHub() {
    if (!window.axMultiHub?.enabled()) throw Error('Ative o modo multi-hub para iniciar pela rede CAN.');
    return (await request('/api/hubs/start', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project_id: window.axMultiHub.projectId() })
    })).json();
  }

  async function resumeMultiHub() {
    if (!window.axMultiHub?.enabled()) throw Error('Ative o modo multi-hub para retomar pela rede CAN.');
    return (await request('/api/hubs/resume', { method: 'POST' })).json();
  }

  function downloadProject() {
    const text = generate(true);
    if (!text) return;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([text], { type: 'text/x-python' }));
    link.download = asset(project().name) + '.py'; link.click(); URL.revokeObjectURL(link.href);
  }

  deviceBtn.onclick = async () => { modal('deviceModal', true); await refresh(); };
  connectionMode.onchange = updateMode;
  saveDevice.onclick = saveHubSettings;
  formatDevice.onclick = formatHub;
  send.onclick = sendProject;
  download.onclick = downloadProject;
  axiomaManifest = manifestForHub;
  window.axTransport = Object.freeze({ request, refresh, sendProject, startMultiHub, resumeMultiHub, requiredCapabilities, packageInfo, hashInfo });
  refresh();
}());
