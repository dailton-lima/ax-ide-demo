/* Entrada contextual da trilha: uma aula inicia um projeto já identificado. */
(() => {
  'use strict';
  const sensorForLesson = Object.freeze({ touch: 'touch', line: 'line', light: 'light', pot: 'pot' });
  const slug = value => String(value || 'aula').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  function showContext(lesson) {
    const bar = document.querySelector('.editor-contextbar');
    if (!bar) return;
    bar.querySelector('.lesson-context-chip')?.remove();
    const chip = document.createElement('span');
    chip.className = 'lesson-context-chip';
    chip.innerHTML = `<span>Aula: ${lesson.title}</span><button type="button" aria-label="Remover contexto da aula">×</button>`;
    chip.querySelector('button').onclick = () => chip.remove();
    bar.appendChild(chip);
  }

  function start(lesson) {
    if (!lesson?.id || typeof newProject !== 'function') return;
    newProject();
    const item = project();
    item.name = 'atividade-' + slug(lesson.id);
    item.lessonContext = { id: lesson.id, title: lesson.title };
    const sensor = sensorForLesson[lesson.id];
    if (sensor) item.config[0] = sensor;
    fileTitle.value = item.name;
    window.axRefreshSensorToolbox?.();
    window.axSetDirty?.(activeId);
    showContext(lesson);
  }

  const previousOpenProject = openProject;
  openProject = function (id) {
    previousOpenProject(id);
    const context = project()?.lessonContext;
    if (context) showContext(context);
    else document.querySelector('.lesson-context-chip')?.remove();
  };

  const style = document.createElement('style');
  style.textContent = '.lesson-context-chip{display:flex;align-items:center;gap:6px;margin-left:auto;border:1px solid #c4b5fd;border-radius:999px;padding:3px 5px 3px 8px;background:#f5f3ff;color:#5b21b6;font-size:10px;font-weight:700;white-space:nowrap}.lesson-context-chip button{width:16px;height:16px;border:0;border-radius:50%;padding:0;color:inherit;background:transparent;font-size:14px;line-height:1}.lesson-context-chip button:hover{background:#ddd6fe}@media(max-width:820px){.lesson-context-chip{display:none}}';
  document.head.appendChild(style);
  window.evoraStartLessonProject = start;
})();
