let dashboardData = {};

async function loadDashboardStats() {
  try {
    showLoading('stats-container');
    dashboardData = await dashboardAPI.getStats();
    renderDashboardStats();
  } catch (error) {
    showError('stats-container', 'Failed to load dashboard statistics');
    console.error(error);
  }
}

function renderDashboardStats() {
  const statsContainer = document.getElementById('stats-container');
  if (!statsContainer) return;

  const html = `
    <div class="stats-grid">
      <div class="stat-card">
        <h3>Users</h3>
        <div class="number">${dashboardData.users || 0}</div>
        <span class="hint">students, teachers, admins</span>
      </div>
      <div class="stat-card">
        <h3>Quizzes</h3>
        <div class="number">${dashboardData.quizzes || 0}</div>
        <span class="hint">draft, published, closed</span>
      </div>
      <div class="stat-card">
        <h3>Question Bank</h3>
        <div class="number">${dashboardData.questions || 0}</div>
        <span class="hint">${dashboardData.answers || 0} answer options</span>
      </div>
      <div class="stat-card">
        <h3>Attempts</h3>
        <div class="number">${dashboardData.results || 0}</div>
        <span class="hint">${Number(dashboardData.passRate || 0)}% pass rate</span>
      </div>
      <div class="stat-card">
        <h3>Average Score</h3>
        <div class="number">${Number(dashboardData.averageScore || 0)}</div>
        <span class="hint">excluding cancelled attempts</span>
      </div>
    </div>

    <div class="dashboard-grid">
      <div class="card">
        <h3 class="card-title">Latest Results</h3>
        ${renderLatestResults()}
      </div>
      <div class="card">
        <h3 class="card-title">Top Quizzes</h3>
        ${renderTopQuizzes()}
      </div>
      <div class="card">
        <h3 class="card-title">User Roles</h3>
        ${renderBreakdown(dashboardData.roleBreakdown, 'role')}
      </div>
      <div class="card">
        <h3 class="card-title">Quiz Status</h3>
        ${renderBreakdown(dashboardData.statusBreakdown, 'status')}
      </div>
      <div class="card">
        <h3 class="card-title">Latest Audit Log</h3>
        ${renderLatestAuditLog()}
      </div>
    </div>
  `;

  statsContainer.innerHTML = html;
}

function renderLatestResults() {
  if (!dashboardData.latestResults || dashboardData.latestResults.length === 0) {
    return '<p class="card-text">No results yet</p>';
  }

  const rows = dashboardData.latestResults.map(result => `
    <tr>
      <td>${result.username || result.student_name || '-'}</td>
      <td>${result.quiz_title}</td>
      <td>${result.score || 0}</td>
      <td>${formatDateShort(result.submitted_at)}</td>
    </tr>
  `).join('');

  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>Quiz</th>
            <th>Score</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
}

function renderTopQuizzes() {
  if (!dashboardData.topQuizzes || dashboardData.topQuizzes.length === 0) {
    return '<p class="card-text">No quiz attempts yet</p>';
  }

  return `
    <div class="mini-list">
      ${dashboardData.topQuizzes.map(quiz => {
        const passRate = Number(quiz.pass_rate || 0);
        return `
          <div class="mini-row">
            <div>
              <strong>${quiz.title || '-'}</strong>
              <span>${quiz.attempts || 0} attempts, avg ${quiz.average_score || 0}</span>
            </div>
            <div class="progress" title="${passRate}% pass rate">
              <div class="progress-bar" style="width: ${Math.min(passRate, 100)}%"></div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderBreakdown(items, labelKey) {
  if (!items || items.length === 0) {
    return '<p class="card-text">No data yet</p>';
  }

  return `
    <div class="mini-list">
      ${items.map(item => `
        <div class="mini-row">
          <strong>${item[labelKey] || '-'}</strong>
          <span>${item.total || 0}</span>
        </div>
      `).join('')}
    </div>
  `;
}

function renderLatestAuditLog() {
  if (!dashboardData.latestAuditLog || dashboardData.latestAuditLog.length === 0) {
    return '<p class="card-text">No audit log yet</p>';
  }

  const rows = dashboardData.latestAuditLog.map(log => `
    <tr>
      <td>${log.operation_type || '-'}</td>
      <td>${log.table_name || '-'}</td>
      <td>${formatTime(log.changed_at)}</td>
    </tr>
  `).join('');

  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Action</th>
            <th>Entity</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
}

function setupAutoRefresh(interval = 30000) {
  setInterval(loadDashboardStats, interval);
}

document.addEventListener('DOMContentLoaded', () => {
  loadDashboardStats();
  setupAutoRefresh();
});
