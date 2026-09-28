/* Configuração visual das seis portas de sensores do Hub Base. */
(function () {
  function render() {
    ports.innerHTML = project().config.map((current, index) => {
      const options = Object.entries(TYPES).map(([value, sensor]) =>
        '<option value="' + value + '" ' + (value === current ? 'selected' : '') + '>' + sensor.label + '</option>'
      ).join('');
      return '<div class="port"><label>Porta ' + (index + 1) + '</label><select data-port="' + index + '">' + options + '</select></div>';
    }).join('');
  }

  function apply() {
    document.querySelectorAll('[data-port]').forEach(field => {
      project().config[Number(field.dataset.port)] = field.value;
    });
    tagsRender();
    if (typeof axRefreshSensorToolbox === 'function') axRefreshSensorToolbox();
    generate();
    if (typeof axSetDirty === 'function') axSetDirty(activeId);
    else save();
    modal('portsModal', false);
  }

  function open() {
    render();
    modal('portsModal', true);
  }

  window.axPorts = Object.freeze({ render, apply, open });
  portsBtn.onclick = open;
  savePorts.onclick = apply;
}());
