// Loads quiz content and answers, then displays results with color coding
async function loadAnswers() {
  try {
    // Get answers from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    
    // Fetch quiz content
    const resp = await fetch('quiz-content.json');
    if (!resp.ok) throw new Error(`HTTP error ${resp.status}`);
    const data = await resp.json();

    const answersList = document.getElementById('answers-list');
    answersList.innerHTML = '';

    let correctCount = 0;
    let totalQuestions = data.questions.length;

    data.questions.forEach((q, index) => {
      const studentAnswer = urlParams.get(q.qid) || '';
      const isCorrect = studentAnswer === q.correct;
      
      if (isCorrect) {
        correctCount++;
      }

      const answerBlock = document.createElement('div');
      answerBlock.className = `answer-block ${isCorrect ? 'correct' : 'incorrect'}`;

      // Question text
      const questionText = document.createElement('div');
      questionText.className = 'question-text';
      questionText.textContent = q.text;
      answerBlock.appendChild(questionText);

      // Student's answer
      if (studentAnswer) {
        const studentAnswerDiv = document.createElement('div');
        studentAnswerDiv.className = 'student-answer';
        const answerLabel = isCorrect ? '✓ Your Answer (Correct)' : '✗ Your Answer (Incorrect)';
        const answerText = studentAnswer + ') ' + q.options[studentAnswer];
        studentAnswerDiv.innerHTML = `<strong>${answerLabel}:</strong> ${answerText}`;
        answerBlock.appendChild(studentAnswerDiv);
      } else {
        const noAnswerDiv = document.createElement('div');
        noAnswerDiv.className = 'student-answer';
        noAnswerDiv.innerHTML = '<strong>No answer selected</strong>';
        answerBlock.appendChild(noAnswerDiv);
      }

      // Correct answer (only show if student got it wrong or didn't answer)
      if (!isCorrect || !studentAnswer) {
        const correctAnswerDiv = document.createElement('div');
        correctAnswerDiv.className = 'correct-answer';
        const correctText = q.correct + ') ' + q.options[q.correct];
        correctAnswerDiv.innerHTML = `<strong>Correct Answer:</strong> ${correctText}`;
        answerBlock.appendChild(correctAnswerDiv);
      }

      // Explanation
      const explanationDiv = document.createElement('div');
      explanationDiv.className = 'explanation';
      explanationDiv.innerHTML = `<strong>Explanation:</strong> ${q.explanation}`;
      answerBlock.appendChild(explanationDiv);

      answersList.appendChild(answerBlock);
    });

    // Update score display
    const scoreDisplay = document.getElementById('score-display');
    scoreDisplay.textContent = `${correctCount} / ${totalQuestions}`;
    
    const percentage = Math.round((correctCount / totalQuestions) * 100);
    const percentageDiv = document.getElementById('percentage');
    percentageDiv.textContent = `${percentage}%`;
    
    // Color code the score
    if (percentage >= 80) {
      scoreDisplay.style.color = '#10b981';
    } else if (percentage >= 60) {
      scoreDisplay.style.color = '#f59e0b';
    } else {
      scoreDisplay.style.color = '#ef4444';
    }

  } catch (error) {
    console.error('Error loading answers:', error);
    document.getElementById('answers-list').innerHTML = 
      '<p>Failed to load quiz answers. See console for details.</p>';
  }
}

document.addEventListener('DOMContentLoaded', loadAnswers);

