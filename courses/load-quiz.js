// Loads quiz-content.json and dynamically renders the quiz in index.html
async function loadQuiz() {
  try {
    const resp = await fetch('quiz-content.json');
    if (!resp.ok) throw new Error(`HTTP error ${resp.status}`);
    const data = await resp.json();

    document.title = data.title;
    document.querySelector('header').textContent = data.title;

    const main = document.querySelector('main');
    main.innerHTML = '';

    data.sections.forEach(section => {
      // Create section container
      const secEl = document.createElement('section');
      secEl.id = section.id;

      // Section title
      const h3 = document.createElement('h3');
      h3.textContent = section.title;
      secEl.appendChild(h3);

      // Add questions
      section.questions.forEach(q => {
        if (section.id === 'free-response') {
          // Free response question block
          const frDiv = document.createElement('div');
          frDiv.className = 'free-response';
          frDiv.setAttribute('data-qid', q.qid);

          const p = document.createElement('p');
          p.innerHTML = q.text;
          frDiv.appendChild(p);

          const textarea = document.createElement('textarea');
          textarea.placeholder = 'Type your answer here...';
          frDiv.appendChild(textarea);

          secEl.appendChild(frDiv);
        } else {
          // Multiple choice question block
          const qDiv = document.createElement('div');
          qDiv.className = 'question';
          qDiv.setAttribute('data-qid', q.qid);

          const p = document.createElement('p');
          p.textContent = q.text;
          qDiv.appendChild(p);

          for (const [key, val] of Object.entries(q.options)) {
            const label = document.createElement('label');
            const input = document.createElement('input');
            input.type = 'radio';
            input.name = q.qid;
            input.value = key;
            label.appendChild(input);
            label.appendChild(document.createTextNode(` ${key}) ${val}`));
            qDiv.appendChild(label);
          }

          secEl.appendChild(qDiv);
        }
      });

      main.appendChild(secEl);
    });

    // Add Show My Responses button
    const btnContainer = document.createElement('div');
    btnContainer.className = 'btn-container';
    const btn = document.createElement('a');
    btn.className = 'btn';
    btn.href = 'answers.html';
    btn.textContent = 'Show My Responses';
    btn.target = '_blank';
    btn.rel = 'noopener noreferrer';

    btnContainer.appendChild(btn);
    main.appendChild(btnContainer);

    // Add event listener to button for passing answers including free response
    btn.addEventListener('click', (event) => {
      event.preventDefault();

      let params = new URLSearchParams();

      // Multiple choice answers
      const mcqQuestions = document.querySelectorAll('section#mcq-vocab .question, section#mcq-code .question');
      mcqQuestions.forEach((qElem) => {
        const qid = qElem.getAttribute('data-qid');
        const selected = qElem.querySelector('input[type="radio"]:checked');
        if (selected) {
          params.append(qid, selected.value);
        }
      });

      // Free response answers
      const freeResponses = document.querySelectorAll('section#free-response .free-response');
      freeResponses.forEach((frElem) => {
        const qid = frElem.getAttribute('data-qid');
        const textarea = frElem.querySelector('textarea');
        if (textarea && textarea.value.trim() !== "") {
          params.append(qid, textarea.value.trim());
        }
      });

      // Build the URL with all answers
      const url = 'answers.html?' + params.toString();

      // Open answers page in a new tab/window
      window.open(url, '_blank', 'noopener');
    });

  } catch (error) {
    console.error('Error loading quiz:', error);
    document.querySelector('header').textContent = 'Failed to load quiz content. See console for details.';
  }
}

document.addEventListener('DOMContentLoaded', loadQuiz);
