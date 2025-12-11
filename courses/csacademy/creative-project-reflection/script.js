/* script.js - Creative Project Reflection with vocabulary dropdowns */

// Helper function to shuffle an array in-place
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// === Global Variables ===
const descText = document.getElementById('desc-text');
const understandingsList = document.getElementById('understandings-list');
const questionsList = document.getElementById('questions-list');
const vocabList = document.getElementById('vocab-list');

const saveBtn = document.getElementById('save-btn');
const loadFileInput = document.getElementById('load-file');
const uploadContentInput = document.getElementById('upload-content-json');
const showBtn = document.getElementById('show-btn');
const clearBtn = document.getElementById('clear-btn');

const fields = {
  name: document.getElementById('student-name'),
  email: document.getElementById('student-email'),
  gradYear: document.getElementById('grad-year')
};

const imageData = {};
const previews = {};
let understandingCheckboxes = [];
let questionInputs = [];
let vocabInputs = [];
let vocabDefinitions = {}; // Will be loaded from JSON

// === Load content.json ===
async function loadContentJSON() {
  try {
    const resp = await fetch('content.json', { cache: "no-store" });
    const json = await resp.json();
    buildPageFromContent(json);
  } catch (err) {
    console.warn('Could not auto-load content.json:', err);
    descText.innerText = 'Please upload content.json using the button below.';
    buildPageFromContent({ understandings: [], essentialQuestions: [], vocabulary: [], vocabDefinitions: {} });
  }
}

// === Build Page from JSON Content ===
function buildPageFromContent(content) {
  if (content.title) document.getElementById('page-title').innerText = content.title;
  if (content.description) descText.innerText = content.description;

  vocabDefinitions = content.vocabDefinitions || {};

  understandingsList.innerHTML = '';
  questionsList.innerHTML = '';
  vocabList.innerHTML = '';
  understandingCheckboxes = [];
  questionInputs = [];
  vocabInputs = [];

  // Unit understandings checklist
  (content.understandings || []).forEach((u, i) => {
    const id = `u-${i}`;
    const div = document.createElement('div');
    div.className = 'check-item';
    div.innerHTML = `<input type="checkbox" id="${id}"><label for="${id}">${u}</label>`;
    understandingsList.appendChild(div);
    understandingCheckboxes.push({ el: div.querySelector('input'), text: u });
  });

  // Essential questions
  (content.essentialQuestions || []).forEach((q, i) => {
    const id = `q-${i}`;
    const div = document.createElement('div');
    div.className = 'question-item';
    div.innerHTML = `
      <label for="${id}"><b>Q${i + 1}:</b> ${q}</label>
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

  // Vocabulary dropdowns
  (content.vocabulary || []).forEach(term => {
    const wrap = document.createElement('label');
    wrap.className = 'term';
    wrap.innerHTML = `<div class="term-head"><b>${term}</b></div>`;

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

  // Objective & Reflection image uploads
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

// === Show Image Preview ===
function showPreview(container, dataUrl) {
  container.innerHTML = '';
  const img = document.createElement('img');
  img.src = dataUrl;
  container.appendChild(img);
}

// === Collect Responses ===
function collectResponses() {
  return {
    meta: {
      name: fields.name.value || '',
      email: fields.email.value || '',
      gradYear: fields.gradYear.value || ''
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

// === Apply Loaded Responses ===
function applyLoadedResponses(data) {
  if (!data) return;
  const m = data.meta || {};
  fields.name.value = m.name || '';
  fields.email.value = m.email || '';
  fields.gradYear.value = m.gradYear || '';

  (data.understandings || []).forEach((u, i) => {
    if (understandingCheckboxes[i]) understandingCheckboxes[i].el.checked = !!u.checked;
  });

  (data.studentQuestions || []).forEach((q, i) => {
    if (questionInputs[i]) questionInputs[i].el.value = q.response || '';
    if (q.image && previews[`q-${i}`]) showPreview(previews[`q-${i}`], q.image);
    imageData[`q-${i}`] = q.image || null;
  });

  // Vocabulary: pre-select student choice
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

// === Download JSON ===
function downloadJSON(filename, obj) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

// === Event Listeners for Buttons ===
saveBtn.addEventListener('click', () => {
  const data = collectResponses();
  const name = (fields.name.value || 'student').replace(/\s+/g, '_').toLowerCase();
  downloadJSON(`${name}_creative_project_reflection.json`, data);
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
  Object.values(fields).forEach(f => f.value = '');
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

// === Generate Printable HTML ===
function generatePrintHtml(data) {
  const section = (title, text, img) => `
    <div class="section">
      <h3>${escapeHtml(title)}</h3>
      <div class="box">${escapeHtml(text || '').replace(/\n/g, '<br>')}</div>
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

  // Vocabulary now uses dynamically loaded definitions
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
      <h1>Creative Project Reflection — Student Responses</h1>
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

// === Escape HTML Helper ===
function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// === Initialize ===
loadContentJSON();



