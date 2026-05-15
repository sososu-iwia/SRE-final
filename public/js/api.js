const API_URL = '/api';

async function apiCall(endpoint, method = 'GET', data = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_URL}${endpoint}`, options);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

const usersAPI = {
  getAll: () => apiCall('/users'),
  getById: (id) => apiCall(`/users/${id}`),
  create: (data) => apiCall('/users', 'POST', data),
  update: (id, data) => apiCall(`/users/${id}`, 'PUT', data),
  delete: (id) => apiCall(`/users/${id}`, 'DELETE')
};

const quizzesAPI = {
  getAll: () => apiCall('/quizzes'),
  getFull: () => apiCall('/quizzes-full'),
  getById: (id) => apiCall(`/quizzes/${id}`),
  create: (data) => apiCall('/quizzes', 'POST', data),
  update: (id, data) => apiCall(`/quizzes/${id}`, 'PUT', data),
  delete: (id) => apiCall(`/quizzes/${id}`, 'DELETE')
};

const questionsAPI = {
  getAll: () => apiCall('/questions'),
  getById: (id) => apiCall(`/questions/${id}`),
  create: (data) => apiCall('/questions', 'POST', data),
  update: (id, data) => apiCall(`/questions/${id}`, 'PUT', data),
  delete: (id) => apiCall(`/questions/${id}`, 'DELETE')
};

const answersAPI = {
  getAll: () => apiCall('/answers'),
  getById: (id) => apiCall(`/answers/${id}`),
  create: (data) => apiCall('/answers', 'POST', data),
  update: (id, data) => apiCall(`/answers/${id}`, 'PUT', data),
  delete: (id) => apiCall(`/answers/${id}`, 'DELETE')
};

const resultsAPI = {
  getAll: () => apiCall('/results'),
  getStudentResults: () => apiCall('/student-results'),
  getById: (id) => apiCall(`/results/${id}`),
  create: (data) => apiCall('/results', 'POST', data),
  update: (id, data) => apiCall(`/results/${id}`, 'PUT', data),
  delete: (id) => apiCall(`/results/${id}`, 'DELETE')
};

const auditAPI = {
  getAll: () => apiCall('/audit-log')
};

const dashboardAPI = {
  getStats: () => apiCall('/dashboard/stats')
};

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('show');
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('show');
  }
}

function closeAllModals() {
  document.querySelectorAll('.modal').forEach(modal => {
    modal.classList.remove('show');
  });
}

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal')) {
    e.target.classList.remove('show');
  }
});

function showNotification(message, type = 'success') {
  const container = document.getElementById('notification-container');
  if (!container) return;

  const notification = document.createElement('div');
  notification.className = type;
  notification.textContent = message;
  notification.style.padding = '12px';
  notification.style.marginBottom = '10px';
  notification.style.borderRadius = '4px';

  container.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

function showLoading(containerId) {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = '<div class="loading">Loading...</div>';
  }
}

function showError(containerId, message) {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = `<div class="error">${message}</div>`;
  }
}

function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString();
}

function formatDateShort(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

function formatTime(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleTimeString();
}
