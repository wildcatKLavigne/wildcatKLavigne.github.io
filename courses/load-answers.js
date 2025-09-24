async function loadAnswers() {
  // Fetch quiz content and answers explanations
  const [quizResp, ansResp] = await Promise.all([
    fetch('quiz-content.json'),
    fetch('answers-content.json')
  ]);
  const quizData = await quizResp.json();
  const ansData = await ansResp.json();

  // Update page title and header
  document.title = ansData.title || 'AP CSA Quiz - Answers';
  document.querySelector('header').textContent = ansData.title || 'Answers';

  const container = document.getElementById('answers-container');
  const frContainer = document.getElementById('free-response-container');

  // Parse URL parameters for student answers
  const params = new URLSearchParams(window.location.search);

  // Utility to escape HTML safely
  function escapeHtml(text) {
    if (!text) return "";
    return text.replace(/&/g, "&amp;")
               .replace(/</g, "&lt;")
               .replace(/>/g, "&gt;")
               .replace(/"/g, "&quot;")
               .replace(/'/g, "&#039;");
  }

  // Render multiple choice questions with highlights and explanations
  quizData.sections.forEach(section => {
    if (section.id === 'free-response') return; // skip free response here

    section.questions.forEach(q => {
      const studentAns = params.get(q.qid);
      const correctAns = q.correct || null;
      const explanation = ansData.multipleChoiceExplanations[q.qid] || '';

      // Build question block
      let html = `<div class="answer-block"><p><strong>${q.text.replace(/\n/g, '<br>')}</strong></p>`;

      for (const [key, val] of Object.entries(q.options)) {
        let cls = '';
        if (studentAns === key) {
          cls = (key === correctAns) ? 'correct-answer' : 'incorrect-answer';
        }
        html += `<div class="option ${cls}">${key}) ${val}</div>`;
      }

      html += `<p class="explanation">${explanation}</p></div>`;

      container.insertAdjacentHTML('beforeend', html);
    });
  });

  // Render free response questions with student answers and canonical responses
  const freeRespSection = quizData.sections.find(s => s.id === 'free-response');
  if (freeRespSection) {
    freeRespSection.questions.forEach(frq => {
      const studentRespRaw = params.get(frq.qid);
      const studentResp = studentRespRaw ? escapeHtml(studentRespRaw) : '<span class="no-response">(No response provided)</span>';
      const canonicalResp = frq.canonical ? escapeHtml(frq.canonical) : '(No sample solution available)';

      let frHtml = `
        <div class="free-response-block">
          <div class="free-response-question">${frq.text}</div>
          <div><strong>Your Response:</strong></div>
          <pre>${studentResp}</pre>
          <div><strong>Sample Solution:</strong></div>
          <div class="canonical-response"><pre>${canonicalResp}</pre></div>
        </div>
      `;

      frContainer.insertAdjacentHTML('beforeend', frHtml);
    });
  }
}

document.addEventListener('DOMContentLoaded', loadAnswers);
