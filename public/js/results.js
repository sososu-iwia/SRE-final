let resultsList = [];

async function loadResults() {
  try {
    showLoading('results-table');
    resultsList = await resultsAPI.getStudentResults();
    renderResultsTable();
  } catch (error) {
    showError('results-table', 'Failed to load results');
    console.error(error);
  }
}

function renderResultsTable() {
  const container = document.getElementById('results-table');
  if (!container) return;

  if (resultsList.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>No results found</p></div>';
    return;
  }

  const rows = resultsList.map(result => `
    <tr>
      <td>${result.result_id || result.id || '-'}</td>
      <td>${result.username || result.student_name || '-'}</td>
      <td>${result.email || '-'}</td>
      <td>${result.quiz_title || '-'}</td>
      <td>${result.score || 0}</td>
      <td>${renderResultBadge(result.performance_level || result.status)}</td>
      <td>${formatDate(result.submitted_at)}</td>
      <td>
        <div class="action-buttons">
          ${result.id ? `<button class="btn-danger" onclick="deleteResult(${result.id})">Delete</button>` : '-'}
        </div>
      </td>
    </tr>
  `).join('');

  container.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Student</th>
            <th>Email</th>
            <th>Quiz</th>
            <th>Score</th>
            <th>Status</th>
            <th>Submitted</th>
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

function renderResultBadge(status) {
  const badgeClass = status === 'passed'
    ? 'success-badge'
    : status === 'failed' || status === 'cancelled'
      ? 'danger-badge'
      : 'warning-badge';
  return `<span class="badge ${badgeClass}">${status || '-'}</span>`;
}

async function deleteResult(id) {
  if (confirm('Are you sure you want to delete this result?')) {
    try {
      await resultsAPI.delete(id);
      showNotification('Result deleted successfully', 'success');
      loadResults();
    } catch (error) {
      showNotification('Failed to delete result', 'error');
      console.error(error);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadResults();
});
