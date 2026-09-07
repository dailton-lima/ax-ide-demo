/* Exportação explícita do diagnóstico do hub conectado. */
(() => {
  'use strict';
  const button = document.createElement('button');
  button.className = 'btn secondary';
  button.type = 'button';
  button.textContent = 'Baixar diagnóstico';
  document.getElementById('formatDevice').insertAdjacentElement('afterend', button);
  button.onclick = async () => {
    button.disabled = true;
    try {
      const report = await (await req('/api/diagnostics')).json();
      const failure = report.last_failure;
      deviceStatus.textContent = failure ? `Última falha: ${failure.kind} · ${failure.detail}` : 'Nenhuma falha registrada.';
      const file = new Blob([JSON.stringify(report, null, 2)], {type: 'application/json'});
      const link = document.createElement('a');
      link.href = URL.createObjectURL(file);
      link.download = 'diagnostico-axioma.json';
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      deviceStatus.textContent = 'Não foi possível obter o diagnóstico: ' + error.message;
    } finally { button.disabled = false; }
  };
})();
