/* Preparação local de mídia para o display e alto-falante do Hub Base. */
(function () {
  const databaseName = 'axioma-studio-assets-v1';
  const storeName = 'assets';

  function database() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(databaseName, 1);
      request.onupgradeneeded = () => request.result.createObjectStore(storeName, { keyPath: 'id' });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function storeAsset(kind, name, data) {
    if (!activeId || !window.indexedDB) return;
    const db = await database();
    await new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      transaction.objectStore(storeName).put({ id: activeId + ':' + kind + ':' + name, projectId: activeId, kind, name, data, version: 1, updatedAt: Date.now() });
      transaction.oncomplete = resolve; transaction.onerror = () => reject(transaction.error);
    });
    db.close();
  }

  async function restoreAssets(projectId) {
    if (!window.indexedDB) return;
    try {
      const db = await database();
      const records = await new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly');
        const request = transaction.objectStore(storeName).getAll();
        request.onsuccess = () => resolve(request.result.filter(record => record.projectId === projectId && record.version === 1));
        request.onerror = () => reject(request.error);
      });
      db.close();
      records.forEach(record => (record.kind === 'audio' ? audio : images).set(record.name, record.data));
      renderAssets(); if (workspace) generate();
    } catch { /* Mídia da sessão continua disponível mesmo sem IndexedDB. */ }
  }

  function renderAssets() {
    assets.textContent = audio.size || images.size ? audio.size + ' áudio · ' + images.size + ' imagem' : 'Nenhum arquivo';
  }

  async function prepareWav(file) {
    const context = new AudioContext();
    const buffer = await context.decodeAudioData(await file.arrayBuffer());
    const frames = Math.ceil(buffer.duration * 16000);
    const output = new Uint8Array(44 + frames * 2);
    const view = new DataView(output.buffer);
    const put = (offset, value) => [...value].forEach((character, index) => view.setUint8(offset + index, character.charCodeAt(0)));
    put(0, 'RIFF'); view.setUint32(4, 36 + frames * 2, true); put(8, 'WAVE'); put(12, 'fmt ');
    view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
    view.setUint32(24, 16000, true); view.setUint32(28, 32000, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
    put(36, 'data'); view.setUint32(40, frames * 2, true);
    for (let index = 0; index < frames; index++) {
      const position = index * (buffer.length - 1) / Math.max(1, frames - 1);
      const start = Math.floor(position); const fraction = position - start;
      let sample = 0;
      for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
        const data = buffer.getChannelData(channel);
        sample += (data[start] * (1 - fraction) + (data[start + 1] || data[start]) * fraction) / buffer.numberOfChannels;
      }
      view.setInt16(44 + index * 2, Math.max(-1, Math.min(1, sample)) * 32767, true);
    }
    await context.close();
    return output;
  }

  async function prepareImage(file) {
    const bitmap = await createImageBitmap(file);
    if (bitmap.width > 240 || bitmap.height > 240) {
      bitmap.close(); throw Error(file.name + ': use uma imagem de até 240 × 240 pixels.');
    }
    const canvas = document.createElement('canvas'); const context = canvas.getContext('2d');
    canvas.width = canvas.height = 240;
    context.fillStyle = '#000'; context.fillRect(0, 0, 240, 240);
    context.drawImage(bitmap, (240 - bitmap.width) >> 1, (240 - bitmap.height) >> 1); bitmap.close();
    const pixels = context.getImageData(0, 0, 240, 240).data; const output = new Uint8Array(115200);
    for (let pixel = 0, offset = 0; pixel < pixels.length; pixel += 4) {
      const rgb565 = ((pixels[pixel] & 248) << 8) | ((pixels[pixel + 1] & 252) << 3) | (pixels[pixel + 2] >> 3);
      output[offset++] = rgb565 >> 8; output[offset++] = rgb565 & 255;
    }
    return output;
  }

  async function addAudio(event) {
    try {
      for (const file of event.target.files) {
        const name = asset(file.name); const data = await prepareWav(file);
        audio.set(name, data); await storeAsset('audio', name, data);
      }
      renderAssets(); generate();
    } catch (error) { alert('Não foi possível preparar o áudio: ' + error.message); }
    event.target.value = '';
  }

  async function addImage(event) {
    try {
      for (const file of event.target.files) {
        const name = asset(file.name); const data = await prepareImage(file);
        images.set(name, data); await storeAsset('image', name, data);
      }
      renderAssets(); generate();
    } catch (error) { alert(error.message); }
    event.target.value = '';
  }

  const openProjectWithMedia = openProject;
  openProject = function (id) {
    audio.clear(); images.clear(); renderAssets();
    openProjectWithMedia(id);
    restoreAssets(id);
  };
  window.axMedia = Object.freeze({ renderAssets, prepareWav, prepareImage, restoreAssets });
  audioFiles.onchange = addAudio;
  imageFiles.onchange = addImage;
  renderAssets();
}());
