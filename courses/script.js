// Routing and rendering for Courses landing and module views
(function () {
  function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  // Known modules; each has a path to a subdirectory containing content.json
  // Display titles/descriptions will be fetched from each content.json
  const modules = [
    { id: 'arduino/blink', path: 'arduino/blink/content.json' },
    { id: 'csacademy/mickey', path: 'csacademy/mickey/content.json' }
  ];

  function show(el) { el.classList.remove('hidden'); }
  function hide(el) { el.classList.add('hidden'); }

  async function fetchJson(path) {
    const res = await fetch(path, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load ' + path);
    return res.json();
  }

  async function renderLanding() {
    const landing = document.getElementById('landing');
    const grid = document.getElementById('modules-grid');
    grid.innerHTML = '';

    // Load titles from each module's content.json
    const details = await Promise.all(modules.map(async (m) => {
      try {
        const data = await fetchJson(m.path);
        return {
          id: m.id,
          title: data.title || m.id,
          description: data.description || ''
        };
      } catch {
        return { id: m.id, title: m.id, description: '' };
      }
    }));

    details.forEach(d => {
      const card = document.createElement('div');
      card.className = 'module-card';
      card.innerHTML = `
        <h3>${escapeHtml(d.title)}</h3>
        <p>${escapeHtml(d.description)}</p>
        <a href="index.html?module=${encodeURIComponent(d.id)}">Open</a>
      `;
      grid.appendChild(card);
    });

    show(landing);
  }

  function renderList(listEl, items, ordered) {
    listEl.innerHTML = '';
    items.forEach((t) => {
      const li = document.createElement('li');
      li.textContent = t;
      listEl.appendChild(li);
    });
    if (ordered) {
      // already an <ol> in template
    }
  }

  function renderVocab(container, vocab, defs) {
    container.innerHTML = '';
    (vocab || []).forEach((term) => {
      const wrap = document.createElement('div');
      wrap.className = 'vocab-row';
      const def = defs && defs[term] ? defs[term] : '';
      wrap.innerHTML = `
        <p><b>${escapeHtml(term)}</b></p>
        <p>${escapeHtml(def)}</p>
      `;
      container.appendChild(wrap);
    });
  }

  async function renderModule(moduleId) {
    const moduleView = document.getElementById('module-view');
    const titleEl = document.getElementById('module-title');
    const descEl = document.getElementById('module-description');
    const understandingsEl = document.getElementById('understandings-list');
    const questionsEl = document.getElementById('questions-list');
    const vocabEl = document.getElementById('vocab-list');

    const mod = modules.find(m => m.id === moduleId);
    if (!mod) {
      titleEl.textContent = 'Module not found';
      descEl.textContent = '';
      show(moduleView);
      return;
    }

    try {
      const data = await fetchJson(mod.path);
      titleEl.textContent = data.title || moduleId;
      descEl.textContent = data.description || '';
      renderList(understandingsEl, data.understandings || [], false);
      renderList(questionsEl, data.essentialQuestions || [], true);
      renderVocab(vocabEl, data.vocabulary || [], data.vocabDefinitions || {});
    } catch (e) {
      titleEl.textContent = 'Failed to load module';
      descEl.textContent = String(e);
    }

    show(moduleView);
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  async function init() {
    const moduleId = getQueryParam('module');
    const landing = document.getElementById('landing');
    const moduleView = document.getElementById('module-view');
    hide(landing);
    hide(moduleView);

    if (!moduleId) {
      await renderLanding();
    } else {
      await renderModule(moduleId);
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();


