/* Evita seleção acidental nas superfícies de interação sem bloquear estudo e código. */
(() => {
  const style = document.createElement('style');
  style.textContent = `
    .skip-link{background:#1e40af;border-radius:0 0 8px 0;color:#fff;font-weight:750;left:0;padding:10px 14px;position:fixed;top:0;transform:translateY(-110%);transition:transform .15s ease;z-index:2000000}
    .skip-link:focus{transform:translateY(0)}
    button,.btn,.tab,.home-nav-item,.file,.learning-card,.axioma-simulator,
    .home-hero,.home-hero *,
    .blocklySvg,.blocklyToolboxDiv,.blocklyFlyout,.blocklyWidgetDiv,
    .editor-config-menu summary,.tags,.hub-monitor,.hub-list,.axsim-stage {
      -webkit-user-select:none;
      user-select:none;
    }
    input,textarea,select,[contenteditable="true"],pre,#code,.sensor-live,
    .lesson-copy,.learning-detail,.diagnostic-report,.axsim-log {
      -webkit-user-select:text;
      user-select:text;
    }
    button:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible,
    [tabindex]:focus-visible,.blocklyToolboxDiv [role="treeitem"]:focus-visible {
      outline:3px solid #8b5cf6;
      outline-offset:2px;
    }
  `;
  document.head.appendChild(style);
})();
