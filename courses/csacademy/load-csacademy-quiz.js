// Loads quiz-content.json and dynamically renders the quiz with select menus
async function loadQuiz() {
  try {
    const resp = await fetch('quiz-content.json');
    if (!resp.ok) throw new Error(`HTTP error ${resp.status}`);
    const data = await resp.json();

    document.getElementById('quiz-title').textContent = data.title;

    const container = document.getElementById('questions-container');
    container.innerHTML = '';

    data.questions.forEach((q, index) => {
      const questionBlock = document.createElement('div');
      questionBlock.className = 'question-block';
      questionBlock.setAttribute('data-qid', q.qid);

      const questionText = document.createElement('p');
      questionText.textContent = q.text;
      questionBlock.appendChild(questionText);

      const select = document.createElement('select');
      select.id = q.qid;
      select.name = q.qid;
      select.setAttribute('data-correct', q.correct);

      // Add default option
      const defaultOption = document.createElement('option');
      defaultOption.value = '';
      defaultOption.textContent = 'Select an answer...';
      select.appendChild(defaultOption);

      // Add answer options
      for (const [key, val] of Object.entries(q.options)) {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = `${key}) ${val}`;
        select.appendChild(option);
      }

      questionBlock.appendChild(select);
      container.appendChild(questionBlock);
    });

    // Add event listener to Check My Work button
    document.getElementById('check-btn').addEventListener('click', () => {
      let params = new URLSearchParams();

      // Collect all answers
      data.questions.forEach(q => {
        const select = document.getElementById(q.qid);
        if (select && select.value) {
          params.append(q.qid, select.value);
        }
      });

      // Build the URL with all answers
      const url = 'quiz-answers.html?' + params.toString();

      // Open answers page in a new tab/window
      window.open(url, '_blank', 'noopener');
    });

  } catch (error) {
    console.error('Error loading quiz:', error);
    document.getElementById('quiz-title').textContent = 'Failed to load quiz content. See console for details.';
  }
}

document.addEventListener('DOMContentLoaded', loadQuiz);

