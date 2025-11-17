// Routing and rendering for Courses landing and module views + full subpage functionality
(function () {
  function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  // ============================================================================
  // CONFIGURATION
  // ============================================================================
  // Set to true to enable Google Classroom integration, false to disable
  const ENABLE_GOOGLE_CLASSROOM = false;
  // Your Google OAuth Client ID (only needed if ENABLE_GOOGLE_CLASSROOM is true)
  const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID';
  // ============================================================================

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
        'arduino/sensor/content.json',
        'csacademy/mickey/content.json',
        'csacademy/shapes/content.json',
        'python/intro/content.json',
        'python/functions/content.json'
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
    const recentModuleEl = document.getElementById('recent-module');
    const topicsContainer = document.getElementById('topics-container');
    
    recentModuleEl.innerHTML = '<p>Loading...</p>';
    topicsContainer.innerHTML = '';

    // Load modules dynamically
    await loadModules();

    if (modules.length === 0) {
      recentModuleEl.innerHTML = '<p>No modules found.</p>';
      show(landing);
      return;
    }

    // Load titles from each module's content.json
    const details = await Promise.all(modules.map(async (m) => {
      try {
        const data = await fetchJson(m.path);
        return {
          id: m.id,
          title: data.title || m.id,
          description: data.description || '',
          topic: m.topic || m.id.split('/')[0],
          added: m.added || new Date().toISOString()
        };
      } catch {
        return { 
          id: m.id, 
          title: m.id, 
          description: '',
          topic: m.topic || m.id.split('/')[0],
          added: m.added || new Date().toISOString()
        };
      }
    }));

    // Find most recently added module
    const sortedByDate = [...details].sort((a, b) => 
      new Date(b.added) - new Date(a.added)
    );
    const mostRecent = sortedByDate[0];

    // Display most recent module
    recentModuleEl.innerHTML = `
      <h2>Most Recent Module</h2>
      <h3>${escapeHtml(mostRecent.title)}</h3>
      <p class="topic-badge">${escapeHtml(mostRecent.topic.toUpperCase())}</p>
      <p>${escapeHtml(mostRecent.description)}</p>
      <a href="index.html?module=${encodeURIComponent(mostRecent.id)}" class="btn">Open Module</a>
    `;

    // Organize modules by topic
    const modulesByTopic = {};
    details.forEach(d => {
      const topic = d.topic;
      if (!modulesByTopic[topic]) {
        modulesByTopic[topic] = [];
      }
      modulesByTopic[topic].push(d);
    });

    // Sort modules within each topic by date (newest first)
    Object.keys(modulesByTopic).forEach(topic => {
      modulesByTopic[topic].sort((a, b) => new Date(b.added) - new Date(a.added));
    });

    const tutorialsByTopic = {
      arduino: [
        { value: 'arduino/ultrasonic/tutorial.html', label: 'Ultrasonic Sensor with LCD Display' }
      ],
      csacademy: [
        { value: 'csacademy/mickey/tutorial.html', label: 'Mickey Circles & Groups Starter' },
        { value: 'csacademy/animation/tutorial.html', label: 'Mickey onStep Animation' }
      ]
    };

    // Create dropdown for each topic
    Object.keys(modulesByTopic).sort().forEach(topic => {
      const topicDiv = document.createElement('div');
      topicDiv.className = 'topic-section';
      
      const topicLabel = document.createElement('label');
      topicLabel.className = 'topic-label';
      topicLabel.textContent = topic.charAt(0).toUpperCase() + topic.slice(1);
      topicLabel.setAttribute('for', `topic-${topic}`);
      
      const select = document.createElement('select');
      select.id = `topic-${topic}`;
      select.className = 'topic-select';
      
      // Add default option
      const defaultOption = document.createElement('option');
      defaultOption.value = '';
      defaultOption.textContent = `Select a ${topic} module...`;
      select.appendChild(defaultOption);
      
      // Add modules for this topic
      modulesByTopic[topic].forEach(module => {
        const option = document.createElement('option');
        option.value = module.id;
        option.textContent = module.title;
        select.appendChild(option);
      });
      
      // Handle selection change
      select.addEventListener('change', (e) => {
        if (e.target.value) {
          window.location.href = `index.html?module=${encodeURIComponent(e.target.value)}`;
        }
      });
      
      topicDiv.appendChild(topicLabel);
      topicDiv.appendChild(select);
      topicsContainer.appendChild(topicDiv);
      
      // Add tutorials dropdown when available
      if (tutorialsByTopic[topic]) {
        const tutorialDiv = document.createElement('div');
        tutorialDiv.className = 'topic-section';
        
        const tutorialLabel = document.createElement('label');
        tutorialLabel.className = 'topic-label';
        tutorialLabel.textContent = `${topic.charAt(0).toUpperCase() + topic.slice(1)} Tutorials`;
        tutorialLabel.setAttribute('for', `tutorials-${topic}`);
        
        const tutorialSelect = document.createElement('select');
        tutorialSelect.id = `tutorials-${topic}`;
        tutorialSelect.className = 'topic-select';
        
        const tutorialDefaultOption = document.createElement('option');
        tutorialDefaultOption.value = '';
        tutorialDefaultOption.textContent = 'Select a tutorial';
        tutorialSelect.appendChild(tutorialDefaultOption);
        
        tutorialsByTopic[topic].forEach(tutorial => {
          const option = document.createElement('option');
          option.value = tutorial.value;
          option.textContent = tutorial.label;
          tutorialSelect.appendChild(option);
        });
        
        tutorialSelect.addEventListener('change', (e) => {
          if (e.target.value) {
            window.location.href = e.target.value;
          }
        });
        
        tutorialDiv.appendChild(tutorialLabel);
        tutorialDiv.appendChild(tutorialSelect);
        topicsContainer.appendChild(tutorialDiv);
      }
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
          .classroom-integration { 
            margin: 20px 0; 
            padding: 20px; 
            border: 2px solid #1a73e8; 
            border-radius: 8px; 
            background: #f8f9fa;
          }
          .classroom-integration h2 { margin-top: 0; color: #1a73e8; }
          .classroom-btn { 
            background: #1a73e8; 
            color: white; 
            border: none; 
            padding: 10px 20px; 
            border-radius: 4px; 
            cursor: pointer; 
            font-size: 14px;
            margin: 5px;
          }
          .classroom-btn:hover { background: #1557b0; }
          .classroom-btn:disabled { background: #ccc; cursor: not-allowed; }
          .classroom-status { margin: 10px 0; padding: 10px; border-radius: 4px; }
          .classroom-status.success { background: #d4edda; color: #155724; }
          .classroom-status.error { background: #f8d7da; color: #721c24; }
          .classroom-status.info { background: #d1ecf1; color: #0c5460; }
          select { padding: 8px; margin: 5px; border-radius: 4px; border: 1px solid #ccc; }
        </style>
        ${ENABLE_GOOGLE_CLASSROOM ? `
        <script src="https://apis.google.com/js/api.js"></script>
        <script src="https://accounts.google.com/gsi/client"></script>
        ` : ''}
      </head>
      <body>
        <h1>Web Design Project — Student Responses</h1>
        <p><strong>${escapeHtml(data.meta.name || '')}</strong> (${escapeHtml(data.meta.email || '')}) — Graduation Year: ${escapeHtml(String(data.meta.gradYear || ''))}</p>

        ${ENABLE_GOOGLE_CLASSROOM ? `
        <div class="classroom-integration">
          <h2>📚 Submit to Google Classroom</h2>
          <div id="classroom-status"></div>
          <div id="classroom-controls">
            <button id="classroom-signin" class="classroom-btn">Sign in with Google</button>
            <div id="classroom-course-select" style="display: none; margin: 10px 0;">
              <label>Select Course: <select id="course-select"></select></label>
            </div>
            <div id="classroom-assignment-select" style="display: none; margin: 10px 0;">
              <label>Select Assignment: <select id="assignment-select"></select></label>
            </div>
            <button id="classroom-submit" class="classroom-btn" style="display: none;" disabled>Submit to Google Classroom</button>
          </div>
        </div>
        ` : ''}

        ${checklist('Unit Understandings', data.understandings || [])}
        ${objectiveHtml}
        ${reflectionHtml}
        ${questionsHtml}

        <h3>Vocabulary</h3>
        <div class="box">${vocabHtml}</div>

        ${ENABLE_GOOGLE_CLASSROOM ? `
        <script>
          ${generateClassroomIntegrationScript(data)}
        </script>
        ` : ''}
      </body>
      </html>
    `;
  }

  function generateClassroomIntegrationScript(data) {
    return `
      (function() {
        const CLIENT_ID = '${GOOGLE_CLIENT_ID}';
        const SCOPES = 'https://www.googleapis.com/auth/classroom.coursework.me https://www.googleapis.com/auth/classroom.courses.readonly https://www.googleapis.com/auth/documents https://www.googleapis.com/auth/drive.file';
        
        let tokenClient;
        let accessToken = null;
        let courses = [];
        let assignments = [];
        let selectedCourseId = null;
        let selectedAssignmentId = null;

        const statusEl = document.getElementById('classroom-status');
        const signinBtn = document.getElementById('classroom-signin');
        const courseSelect = document.getElementById('course-select');
        const assignmentSelect = document.getElementById('assignment-select');
        const courseSelectDiv = document.getElementById('classroom-course-select');
        const assignmentSelectDiv = document.getElementById('classroom-assignment-select');
        const submitBtn = document.getElementById('classroom-submit');

        function showStatus(message, type = 'info') {
          statusEl.innerHTML = '<div class="classroom-status ' + type + '">' + escapeHtml(message) + '</div>';
        }

        function escapeHtml(str) {
          return String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
        }

        function initializeGapi() {
          return new Promise((resolve, reject) => {
            gapi.load('client', () => {
              gapi.client.init({
                apiKey: '', // Optional: API key if needed
                discoveryDocs: [
                  'https://classroom.googleapis.com/$discovery/rest?version=v1',
                  'https://docs.googleapis.com/$discovery/rest?version=v1',
                  'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
                ]
              }).then(() => {
                resolve();
              }).catch(reject);
            });
          });
        }

        function initializeTokenClient() {
          tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: (response) => {
              if (response.error) {
                showStatus('Authentication failed: ' + response.error, 'error');
                return;
              }
              accessToken = response.access_token;
              signinBtn.textContent = 'Signed in';
              signinBtn.disabled = true;
              loadCourses();
            }
          });
        }

        signinBtn.addEventListener('click', () => {
          if (!CLIENT_ID || CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID') {
            showStatus('Please configure your Google OAuth Client ID in the script. See GOOGLE_CLASSROOM_SETUP.md for instructions.', 'error');
            return;
          }
          if (!tokenClient) {
            initializeGapi().then(() => {
              initializeTokenClient();
              tokenClient.requestAccessToken({ prompt: 'consent' });
            }).catch(err => {
              showStatus('Failed to initialize Google API: ' + err.message, 'error');
            });
          } else {
            tokenClient.requestAccessToken({ prompt: 'consent' });
          }
        });

        async function loadCourses() {
          try {
            showStatus('Loading courses...', 'info');
            const response = await gapi.client.classroom.courses.list({
              studentId: 'me',
              courseStates: 'ACTIVE'
            });
            courses = response.result.courses || [];
            
            if (courses.length === 0) {
              showStatus('No active courses found.', 'error');
              return;
            }

            courseSelect.innerHTML = '<option value="">Select a course...</option>';
            courses.forEach(course => {
              const option = document.createElement('option');
              option.value = course.id;
              option.textContent = course.name;
              courseSelect.appendChild(option);
            });
            
            courseSelectDiv.style.display = 'block';
            showStatus('Select a course to continue.', 'info');
          } catch (err) {
            showStatus('Failed to load courses: ' + err.message, 'error');
          }
        }

        courseSelect.addEventListener('change', async (e) => {
          selectedCourseId = e.target.value;
          if (!selectedCourseId) {
            assignmentSelectDiv.style.display = 'none';
            submitBtn.style.display = 'none';
            return;
          }
          
          try {
            showStatus('Loading assignments...', 'info');
            const response = await gapi.client.classroom.courses.courseWork.list({
              courseId: selectedCourseId
            });
            assignments = response.result.courseWork || [];
            
            if (assignments.length === 0) {
              showStatus('No assignments found for this course.', 'error');
              return;
            }

            assignmentSelect.innerHTML = '<option value="">Select an assignment...</option>';
            assignments.forEach(assignment => {
              const option = document.createElement('option');
              option.value = assignment.id;
              option.textContent = assignment.title;
              assignmentSelect.appendChild(option);
            });
            
            assignmentSelectDiv.style.display = 'block';
            showStatus('Select an assignment to submit.', 'info');
          } catch (err) {
            showStatus('Failed to load assignments: ' + err.message, 'error');
          }
        });

        assignmentSelect.addEventListener('change', (e) => {
          selectedAssignmentId = e.target.value;
          submitBtn.disabled = !selectedAssignmentId;
          submitBtn.style.display = selectedAssignmentId ? 'inline-block' : 'none';
        });

        submitBtn.addEventListener('click', async () => {
          if (!selectedCourseId || !selectedAssignmentId) {
            showStatus('Please select a course and assignment.', 'error');
            return;
          }

          try {
            submitBtn.disabled = true;
            showStatus('Creating Google Doc...', 'info');
            
            // Create Google Doc with the response content
            const docContent = generateDocContent(${JSON.stringify(data)});
            const doc = await gapi.client.docs.documents.create({
              title: 'Student Response - ' + new Date().toLocaleDateString()
            });
            
            const docId = doc.result.documentId;
            showStatus('Adding content to document...', 'info');
            
            // Insert content into the document
            await gapi.client.docs.documents.batchUpdate({
              documentId: docId,
              requests: docContent
            });

            showStatus('Submitting to Google Classroom...', 'info');
            
            // Get student submission (submissions are automatically created when student accesses assignment)
            const listResponse = await gapi.client.classroom.courses.courseWork.studentSubmissions.list({
              courseId: selectedCourseId,
              courseWorkId: selectedAssignmentId,
              userId: 'me'
            });
            
            if (!listResponse.result.studentSubmissions || listResponse.result.studentSubmissions.length === 0) {
              throw new Error('No submission found. Please open the assignment in Google Classroom first.');
            }
            
            const submission = listResponse.result.studentSubmissions[0];
            const submissionId = submission.id;
            
            // Add attachment to submission
            await gapi.client.classroom.courses.courseWork.studentSubmissions.modifyAttachments({
              courseId: selectedCourseId,
              courseWorkId: selectedAssignmentId,
              id: submissionId
            }, {
              addAttachments: [{
                driveFile: {
                  id: docId,
                  title: 'Student Response'
                }
              }]
            });
            
            // Turn in the submission
            await gapi.client.classroom.courses.courseWork.studentSubmissions.turnIn({
              courseId: selectedCourseId,
              courseWorkId: selectedAssignmentId,
              id: submissionId
            });

            showStatus('Successfully submitted to Google Classroom!', 'success');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitted ✓';
          } catch (err) {
            showStatus('Failed to submit: ' + err.message, 'error');
            submitBtn.disabled = false;
          }
        });

        function generateDocContent(data) {
          const requests = [];
          let index = 1;
          
          // Title
          requests.push({
            insertText: {
              location: { index: index },
              text: 'Student Response\\n\\n'
            }
          });
          index += 'Student Response\\n\\n'.length;
          
          // Student info
          requests.push({
            insertText: {
              location: { index: index },
              text: 'Student: ' + (data.meta.name || '') + '\\n'
            }
          });
          index += ('Student: ' + (data.meta.name || '') + '\\n').length;
          
          requests.push({
            insertText: {
              location: { index: index },
              text: 'Email: ' + (data.meta.email || '') + '\\n'
            }
          });
          index += ('Email: ' + (data.meta.email || '') + '\\n').length;
          
          requests.push({
            insertText: {
              location: { index: index },
              text: 'Graduation Year: ' + (data.meta.gradYear || '') + '\\n\\n'
            }
          });
          index += ('Graduation Year: ' + (data.meta.gradYear || '') + '\\n\\n').length;
          
          // Unit Understandings
          if (data.understandings && data.understandings.length > 0) {
            requests.push({
              insertText: {
                location: { index: index },
                text: 'Unit Understandings\\n'
              }
            });
            index += 'Unit Understandings\\n'.length;
            
            data.understandings.forEach(u => {
              const text = (u.checked ? '✓ ' : '  ') + u.text + '\\n';
              requests.push({
                insertText: {
                  location: { index: index },
                  text: text
                }
              });
              index += text.length;
            });
            requests.push({
              insertText: {
                location: { index: index },
                text: '\\n'
              }
            });
            index += 2;
          }
          
          // Objective
          if (data.objective && data.objective.text) {
            requests.push({
              insertText: {
                location: { index: index },
                text: 'Objective\\n' + data.objective.text + '\\n\\n'
              }
            });
            index += ('Objective\\n' + data.objective.text + '\\n\\n').length;
          }
          
          // Reflection
          if (data.reflection && data.reflection.text) {
            requests.push({
              insertText: {
                location: { index: index },
                text: 'Reflection\\n' + data.reflection.text + '\\n\\n'
              }
            });
            index += ('Reflection\\n' + data.reflection.text + '\\n\\n').length;
          }
          
          // Essential Questions
          if (data.studentQuestions && data.studentQuestions.length > 0) {
            data.studentQuestions.forEach((q, i) => {
              requests.push({
                insertText: {
                  location: { index: index },
                  text: 'Question ' + (i + 1) + ': ' + q.text + '\\n'
                }
              });
              index += ('Question ' + (i + 1) + ': ' + q.text + '\\n').length;
              
              if (q.response) {
                requests.push({
                  insertText: {
                    location: { index: index },
                    text: q.response + '\\n\\n'
                  }
                });
                index += (q.response + '\\n\\n').length;
              }
            });
          }
          
          // Vocabulary
          if (data.vocabulary && data.vocabulary.length > 0) {
            requests.push({
              insertText: {
                location: { index: index },
                text: 'Vocabulary\\n'
              }
            });
            index += 'Vocabulary\\n'.length;
            
            data.vocabulary.forEach(v => {
              const text = v.term + ': ' + v.definition + '\\n';
              requests.push({
                insertText: {
                  location: { index: index },
                  text: text
                }
              });
              index += text.length;
            });
          }
          
          return { requests: requests };
        }

        // Initialize on load
        if (typeof gapi !== 'undefined' && typeof google !== 'undefined') {
          initializeGapi().then(() => {
            initializeTokenClient();
            showStatus('Ready to sign in with Google Classroom.', 'info');
          }).catch(err => {
            showStatus('Failed to initialize: ' + err.message, 'error');
          });
        } else {
          showStatus('Google API libraries not loaded. Please refresh the page.', 'error');
        }
      })();
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


