let quizzesList = [];
let editingQuizId = null;

async function loadQuizzes() {
  try {
    showLoading('quizzes-table');
    quizzesList = await quizzesAPI.getFull();
    renderQuizzesTable();
  } catch (error) {
    showError('quizzes-table', 'Failed to load quizzes');
    console.error(error);
  }
}

function renderQuizzesTable() {
  const container = document.getElementById('quizzes-table');
  if (!container) return;

  if (quizzesList.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>No quizzes found</p></div>';
    return;
  }

  const rows = quizzesList.map(quiz => `
    <tr>
      <td>${quiz.quiz_id || quiz.id}</td>
      <td>${quiz.title || '-'}</td>
      <td>${renderStatusBadge(quiz.status)}</td>
      <td>${quiz.created_by || '-'}</td>
      <td>${(quiz.questions || []).length}</td>
      <td>${formatDateShort(quiz.created_at)}</td>
      <td>
        <div class="action-buttons">
          <button class="btn-secondary" onclick="editQuiz(${quiz.quiz_id || quiz.id})">Edit</button>
          <button class="btn-danger" onclick="deleteQuiz(${quiz.quiz_id || quiz.id})">Delete</button>
        </div>
      </td>
    </tr>
    <tr class="details-row">
      <td colspan="7">${renderQuizDetails(quiz)}</td>
    </tr>
  `).join('');

  container.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Status</th>
            <th>Created By</th>
            <th>Questions</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
}

function renderStatusBadge(status) {
  const badgeClass = status === 'published'
    ? 'success-badge'
    : status === 'closed'
      ? 'warning-badge'
      : '';
  return `<span class="badge ${badgeClass}">${status || '-'}</span>`;
}

function renderQuizDetails(quiz) {
  if (!quiz.questions || quiz.questions.length === 0) {
    return '<div class="nested-list">No questions yet</div>';
  }

  return `
    <div class="nested-list">
      ${quiz.questions.map(question => `
        <div class="nested-item">
          <strong>Q${question.question_id || question.id}:</strong> ${question.text || '-'}
          <ul>
            ${(question.answers || []).map(answer => `
              <li>${answer.is_correct ? '<span class="badge success-badge">Correct</span>' : '<span class="badge">Option</span>'} ${answer.text || '-'}</li>
            `).join('')}
          </ul>
        </div>
      `).join('')}
    </div>
  `;
}

function openAddQuizModal() {
  editingQuizId = null;
  document.getElementById('quiz-form').reset();
  document.getElementById('quizModalTitle').textContent = 'Add New Quiz';
  openModal('quizModal');
}

async function editQuiz(id) {
  try {
    const quiz = await quizzesAPI.getById(id);
    editingQuizId = id;
    document.getElementById('quiz-title').value = quiz.title || '';
    document.getElementById('quiz-created-by').value = quiz.created_by || '';
    document.getElementById('quiz-status').value = quiz.status || 'draft';
    document.getElementById('quizModalTitle').textContent = 'Edit Quiz';
    openModal('quizModal');
  } catch (error) {
    showNotification('Failed to load quiz', 'error');
    console.error(error);
  }
}

async function saveQuiz() {
  try {
    const data = {
      title: document.getElementById('quiz-title').value,
      created_by: document.getElementById('quiz-created-by').value,
      status: document.getElementById('quiz-status').value
    };

    if (!data.title || !data.created_by) {
      showNotification('Please enter title and creator user ID', 'error');
      return;
    }

    if (editingQuizId) {
      await quizzesAPI.update(editingQuizId, data);
      showNotification('Quiz updated successfully', 'success');
    } else {
      data.created_at = new Date().toISOString();
      await quizzesAPI.create(data);
      showNotification('Quiz created successfully', 'success');
    }

    closeModal('quizModal');
    loadQuizzes();
  } catch (error) {
    showNotification('Failed to save quiz', 'error');
    console.error(error);
  }
}

async function deleteQuiz(id) {
  if (confirm('Are you sure you want to delete this quiz?')) {
    try {
      await quizzesAPI.delete(id);
      showNotification('Quiz deleted successfully', 'success');
      loadQuizzes();
    } catch (error) {
      showNotification('Failed to delete quiz', 'error');
      console.error(error);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadQuizzes();

  const quizForm = document.getElementById('quiz-form');
  if (quizForm) {
    quizForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveQuiz();
    });
  }

  const closeBtn = document.getElementById('quiz-close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      closeModal('quizModal');
    });
  }
});
