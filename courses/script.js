// Routing and rendering for Courses landing and module views + full subpage functionality
(function () {
  function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  // Modules will be loaded dynamically from modules.json
  let modules = [];

  function show(el) { el.classList.remove('hidden'); }
  function hide(el) { el.classList.add('hidden'); }

  async function fetchJson(path) {
    const res = await fetch(path, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load ' + path);
    return res.json();
  }

  // Dynamically discover modules by loading modules.json
  async function loadModules() {
    try {
      modules = await fetchJson('modules.json');
    } catch (err) {
      console.warn('Could not load modules.json, trying to discover modules...', err);
      // Fallback: try to discover modules by attempting common subdirectory patterns
      const commonPaths = [
        'arduino/blink/content.json',
        'csacademy/mickey/content.json',
        'python/intro/content.json'
      ];
      modules = [];
      for (const path of commonPaths) {
        try {
          await fetchJson(path);
          // Extract module id from path (e.g., "arduino/blink/content.json" -> "arduino/blink")
          const id = path.replace('/content.json', '');
          modules.push({ id, path });
        } catch {
          // Module doesn't exist at this path, skip it
        }
      }
    }
  }

  async function renderLanding() {
    const landing = document.getElementById('landing');
    const grid = document.getElementById('modules-grid');
    grid.innerHTML = '<p>Loading modules...</p>';

    // Load modules dynamically
    await loadModules();

    if (modules.length === 0) {
      grid.innerHTML = '<p>No modules found.</p>';
      show(landing);
      return;
    }

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

  // ==== Web Design Reflection features ====
  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  let imageData = {};
  let previews = {};
  let understandingCheckboxes = [];
  let questionInputs = [];
  let vocabInputs = [];
  let vocabDefinitions = {};

  function buildPageFromContent(content) {
    const titleEl = document.getElementById('module-title');
    const descEl = document.getElementById('desc-text');
    if (content.title) titleEl.textContent = content.title;
    if (content.description) descEl.textContent = content.description;

    vocabDefinitions = content.vocabDefinitions || {};

    const understandingsList = document.getElementById('understandings-list');
    const questionsList = document.getElementById('questions-list');
    const vocabList = document.getElementById('vocab-list');
    understandingsList.innerHTML = '';
    questionsList.innerHTML = '';
    vocabList.innerHTML = '';
    understandingCheckboxes = [];
    questionInputs = [];
    vocabInputs = [];

    (content.understandings || []).forEach((u, i) => {
      const id = `u-${i}`;
      const div = document.createElement('div');
      div.className = 'check-item';
      div.innerHTML = `<input type="checkbox" id="${id}"><label for="${id}">${escapeHtml(u)}</label>`;
      understandingsList.appendChild(div);
      understandingCheckboxes.push({ el: div.querySelector('input'), text: u });
    });

    (content.essentialQuestions || []).forEach((q, i) => {
      const id = `q-${i}`;
      const div = document.createElement('div');
      div.className = 'question-item';
      div.innerHTML = `
        <label for="${id}"><b>Q${i + 1}:</b> ${escapeHtml(q)}</label>
        <textarea id="${id}" placeholder="Type your response here..."></textarea>
        <input type="file" id="${id}-img" accept="image/*" />
        <div class="preview" id="${id}-preview"></div>
      `;
      questionsList.appendChild(div);
      questionInputs.push({ el: div.querySelector('textarea'), text: q });

      const input = div.querySelector(`#${id}-img`);
      const preview = div.querySelector(`#${id}-preview`);
      previews[id] = preview;

      input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          imageData[id] = ev.target.result;
          showPreview(preview, ev.target.result);
        };
        reader.readAsDataURL(file);
      });
    });

    (content.vocabulary || []).forEach(term => {
      const wrap = document.createElement('label');
      wrap.className = 'term';
      wrap.innerHTML = `<div class="term-head"><b>${escapeHtml(term)}</b></div>`;

      const correctDef = vocabDefinitions[term] || '';
      const otherDefs = Object.values(vocabDefinitions).filter(d => d !== correctDef);
      shuffleArray(otherDefs);
      const options = [correctDef, otherDefs[0] || '', otherDefs[1] || ''];
      shuffleArray(options);

      const select = document.createElement('select');
      select.dataset.term = term;

      options.forEach(opt => {
        const optionEl = document.createElement('option');
        optionEl.value = opt;
        optionEl.textContent = opt;
        select.appendChild(optionEl);
      });

      wrap.appendChild(select);
      vocabList.appendChild(wrap);

      vocabInputs.push({ term, el: select, correct: correctDef });
    });

    ['objective', 'reflection'].forEach(id => {
      const input = document.getElementById(`${id}-img`);
      const preview = document.getElementById(`${id}-preview`);
      previews[id] = preview;

      input.addEventListener('change', e => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => {
          imageData[id] = ev.target.result;
          showPreview(preview, ev.target.result);
        };
        reader.readAsDataURL(file);
      });
    });
  }

  function showPreview(container, dataUrl) {
    container.innerHTML = '';
    const img = document.createElement('img');
    img.src = dataUrl;
    container.appendChild(img);
  }

  function collectResponses() {
    return {
      meta: {
        name: document.getElementById('student-name')?.value || '',
        email: document.getElementById('student-email')?.value || '',
        gradYear: document.getElementById('grad-year')?.value || ''
      },
      understandings: understandingCheckboxes.map(c => ({ text: c.text, checked: c.el.checked })),
      studentQuestions: questionInputs.map((c, i) => ({
        text: c.text,
        response: c.el.value,
        image: imageData[`q-${i}`] || null
      })),
      vocabulary: vocabInputs.map(v => ({ term: v.term, definition: v.el.value })),
      objective: {
        text: document.getElementById('objective').value,
        image: imageData['objective'] || null
      },
      reflection: {
        text: document.getElementById('reflection').value,
        image: imageData['reflection'] || null
      },
      savedAt: new Date().toISOString()
    };
  }

  function applyLoadedResponses(data) {
    if (!data) return;
    const nameEl = document.getElementById('student-name');
    const emailEl = document.getElementById('student-email');
    const yearEl = document.getElementById('grad-year');
    const m = data.meta || {};
    if (nameEl) nameEl.value = m.name || '';
    if (emailEl) emailEl.value = m.email || '';
    if (yearEl) yearEl.value = m.gradYear || '';

    (data.understandings || []).forEach((u, i) => {
      if (understandingCheckboxes[i]) understandingCheckboxes[i].el.checked = !!u.checked;
    });

    (data.studentQuestions || []).forEach((q, i) => {
      if (questionInputs[i]) questionInputs[i].el.value = q.response || '';
      if (q.image && previews[`q-${i}`]) showPreview(previews[`q-${i}`], q.image);
      imageData[`q-${i}`] = q.image || null;
    });

    (data.vocabulary || []).forEach((v, i) => {
      if (vocabInputs[i] && v.definition) {
        vocabInputs[i].el.value = v.definition;
      }
    });

    ['objective', 'reflection'].forEach(id => {
      const el = document.getElementById(id);
      if (el && data[id]) el.value = data[id].text || '';
      if (previews[id] && data[id] && data[id].image) showPreview(previews[id], data[id].image);
      imageData[id] = data[id] ? data[id].image || null : null;
    });
  }

  function downloadJSON(filename, obj) {
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function generatePrintHtml(data) {
    const section = (title, text, img) => `
      <div class="section">
        <h3>${escapeHtml(title)}</h3>
        <div class="box">${escapeHtml(text || '').replace(/\\n/g, '<br>')}</div>
        ${img ? `<img src="${img}" alt="Screenshot for ${escapeHtml(title)}" />` : ''}
      </div>
    `;

    const checklist = (label, arr) =>
      `<h3>${escapeHtml(label)}</h3><ul>${arr
        .map(x => `<li>${escapeHtml(x.text)} ${x.checked ? '✔️' : ''}</li>`)
        .join('')}</ul>`;

    const questionsHtml = (data.studentQuestions || [])
      .map(q => section(q.text, q.response, q.image))
      .join('');

    const objectiveHtml = section('Objective', data.objective?.text || '', data.objective?.image || null);
    const reflectionHtml = section('Reflection', data.reflection?.text || '', data.reflection?.image || null);

    const vocabHtml = (data.vocabulary || []).map(v => {
      const correct = vocabDefinitions[v.term] || '';
      const student = v.definition || '';
      const status = student === correct ? '✅ Correct' : '❌ Incorrect';
      return `
        <div class="vocab-item">
          <b>${escapeHtml(v.term)}:</b><br>
          Definition Provided by Student: "${escapeHtml(student)}"<br>
          Correct Definition: "${escapeHtml(correct)}" ${status}
        </div>
      `;
    }).join('<br>');

    return `
      <!doctype html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Printable Responses</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 30px; color: #111; }
          h1 { color: #1565c0; }
          .section { margin-bottom: 16px; }
          .box { border: 1px solid #ccc; background: #f9f9f9; padding: 10px; border-radius: 6px; }
          img { display: block; margin-top: 8px; max-width: 500px; border-radius: 6px; border: 1px solid #ccc; }
          ul { margin-left: 20px; }
          .vocab-item { margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <h1>Web Design Project — Student Responses</h1>
        <p><strong>${escapeHtml(data.meta.name || '')}</strong> (${escapeHtml(data.meta.email || '')}) — Graduation Year: ${escapeHtml(String(data.meta.gradYear || ''))}</p>

        ${checklist('Unit Understandings', data.understandings || [])}
        ${objectiveHtml}
        ${reflectionHtml}
        ${questionsHtml}

        <h3>Vocabulary</h3>
        <div class="box">${vocabHtml}</div>
      </body>
      </html>
    `;
  }

  async function renderModule(moduleId) {
    const moduleView = document.getElementById('module-view');

    // Ensure modules are loaded
    if (modules.length === 0) {
      await loadModules();
    }

    const mod = modules.find(m => m.id === moduleId);
    if (!mod) {
      document.getElementById('module-title').textContent = 'Module not found';
      document.getElementById('desc-text').textContent = '';
      show(moduleView);
      return;
    }

    try {
      const data = await fetchJson(mod.path);
      buildPageFromContent(data);

      // Wire buttons for this module view
      const saveBtn = document.getElementById('save-btn');
      const loadFileInput = document.getElementById('load-file');
      const uploadContentInput = document.getElementById('upload-content-json');
      const showBtn = document.getElementById('show-btn');
      const clearBtn = document.getElementById('clear-btn');

      imageData = {};
      previews = {};

      saveBtn.addEventListener('click', () => {
        const data = collectResponses();
        const name = (document.getElementById('student-name').value || 'student').replace(/\\s+/g, '_').toLowerCase();
        downloadJSON(`${name}_web_design_responses.json`, data);
      });

      loadFileInput.addEventListener('change', (e) => {
        const f = e.target.files[0];
        if (!f) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          try { applyLoadedResponses(JSON.parse(ev.target.result)); }
          catch { alert('Invalid JSON file.'); }
        };
        reader.readAsText(f);
        loadFileInput.value = '';
      });

      uploadContentInput.addEventListener('change', (e) => {
        const f = e.target.files[0];
        if (!f) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          try { buildPageFromContent(JSON.parse(ev.target.result)); }
          catch { alert('Invalid content.json file.'); }
        };
        reader.readAsText(f);
        uploadContentInput.value = '';
      });

      showBtn.addEventListener('click', () => {
        const data = collectResponses();
        const html = generatePrintHtml(data);
        const w = window.open('', '_blank');
        if (!w) { alert('Please allow popups to view your responses.'); return; }
        w.document.open();
        w.document.write(html);
        w.document.close();
      });

      clearBtn.addEventListener('click', () => {
        if (!confirm('Clear all responses?')) return;
        ['student-name','student-email','grad-year'].forEach(id => {
          const el = document.getElementById(id); if (el) el.value = '';
        });
        understandingCheckboxes.forEach(c => c.el.checked = false);
        questionInputs.forEach(c => c.el.value = '');
        vocabInputs.forEach(v => v.el.value = '');
        ['objective', 'reflection'].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.value = '';
          if (previews[id]) previews[id].innerHTML = '';
          imageData[id] = null;
        });
        Object.keys(imageData).forEach(k => {
          if (!['objective','reflection'].includes(k)) imageData[k] = null;
          if (previews[k]) previews[k].innerHTML = '';
        });
      });
    } catch (e) {
      document.getElementById('module-title').textContent = 'Failed to load module';
      const descEl = document.getElementById('desc-text');
      if (descEl) descEl.textContent = String(e);
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


