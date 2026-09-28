/* Cartões de categorias Blockly independentes do ciclo de vida do simulador. */
(() => {
  const categories = {
    Programa: { color: '#475569', icon: '▣' }, Motores: { color: '#d95d39', icon: '⚙' }, Movimento: { color: '#2563eb', icon: '↔' }, Sensores: { color: '#0f9f8c', icon: '◉' },
    Ações: { color: '#8b5cf6', icon: '⚡' }, Mídia: { color: '#a55f15', icon: '◌' }, Controle: { color: '#e67e22', icon: '⌘' }, Variáveis: { color: '#147fa8', icon: '◇' },
    Listas: { color: '#0f766e', icon: '☷' }, Funções: { color: '#6d4bc4', icon: 'ƒ' }, Lógica: { color: '#d14c72', icon: '◆' }, Matemática: { color: '#34875b', icon: '∑' }, Texto: { color: '#0284c7', icon: '✎' }
  };
  const style = document.createElement('style');
  style.textContent = `
    .blocklyToolboxCategoryGroup{display:grid!important;width:184px!important;gap:7px!important;padding:10px!important}
    .blocklyToolboxCategoryContainer.evora-category{width:100%!important;min-height:46px!important;margin:0!important;padding:0 13px!important;display:flex!important;align-items:center!important;border:1px solid #dbe5f1!important;border-left:4px solid var(--evora-category)!important;border-radius:8px!important;background:#fff!important;box-shadow:none!important;cursor:pointer!important;transition:border-color .14s ease,box-shadow .14s ease,transform .14s ease}
    .blocklyToolboxCategoryContainer.evora-category:hover{border-color:color-mix(in srgb,var(--evora-category) 55%,white)!important;border-left-color:var(--evora-category)!important;box-shadow:0 3px 8px rgba(15,23,42,.08)!important;transform:translateY(-1px)}
    .blocklyToolboxCategoryContainer.evora-category:focus,.blocklyToolboxCategoryContainer.evora-category:focus-visible{outline:3px solid color-mix(in srgb,var(--evora-category) 42%,white)!important;outline-offset:2px!important;box-shadow:0 0 0 1px var(--evora-category)!important}
    .blocklyToolboxCategoryContainer.evora-category[aria-selected="true"],.blocklyToolboxCategoryContainer.evora-category.blocklyToolboxSelected{background:#fff!important;border-left-color:var(--evora-category)!important;box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--evora-category) 22%,white)!important}
    .blocklyToolboxCategoryContainer.evora-category:before,.blocklyToolboxCategoryContainer.evora-category .blocklyToolboxCategoryIcon{content:none!important;display:none!important}
    .blocklyToolboxCategoryContainer.evora-category .blocklyToolboxCategory,.blocklyToolboxCategoryContainer.evora-category .blocklyToolboxCategory.blocklyToolboxSelected{display:flex!important;align-items:center!important;width:100%!important;min-height:44px!important;margin:0!important;padding:0!important;border:0!important;border-left:0!important;background:transparent!important;box-shadow:none!important}
    .blocklyToolboxCategoryContainer.evora-category .evora-category-icon-slot{display:inline-flex!important;align-items:center!important;justify-content:center;flex:0 0 22px!important;width:22px!important;height:22px!important;margin-right:8px!important;background:transparent!important;color:var(--evora-category)!important;font-family:"Segoe UI Symbol","Aptos",sans-serif!important;font-size:18px!important;font-weight:800!important;line-height:1!important}
    .blocklyToolboxCategoryContainer.evora-category .blocklyToolboxCategoryLabel{display:flex!important;align-items:center!important;min-height:44px!important;margin:0!important;padding:0!important;background:transparent!important;color:#334155!important;font-family:"Aptos","Segoe UI Variable","Segoe UI",Arial,sans-serif!important;font-size:12px!important;font-weight:750!important;letter-spacing:-.01em;line-height:1!important}
  `;
  document.head.appendChild(style);

  const decorate = () => document.querySelectorAll('.blocklyToolboxCategoryContainer').forEach(card => {
    const label = card.querySelector('.blocklyToolboxCategoryLabel')?.textContent.trim();
    const category = categories[label];
    if (!category) return;
    card.classList.add('evora-category');
    card.style.setProperty('--evora-category', category.color);
    const row = card.querySelector('.blocklyToolboxCategory');
    if (row) row.style.setProperty('border-left', '0', 'important');
    if (row && !row.querySelector('.evora-category-icon-slot')) {
      const slot = document.createElement('span');
      slot.className = 'evora-category-icon-slot';
      slot.setAttribute('aria-hidden', 'true');
      slot.textContent = category.icon;
      row.prepend(slot);
    }
  });

  window.evoraPaintBlocklyToolbox = decorate;
  new MutationObserver(() => requestAnimationFrame(decorate)).observe(document.body, { childList: true, subtree: true });
  document.addEventListener('evora:toolbox-ready', () => requestAnimationFrame(decorate));
  document.addEventListener('pointerdown', () => requestAnimationFrame(decorate), true);
  document.addEventListener('focusin', event => {
    if (event.target.matches?.('.blocklyToolboxCategoryContainer')) requestAnimationFrame(decorate);
  });
  decorate();
})();
