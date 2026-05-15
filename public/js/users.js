let usersList = [];
let editingUserId = null;

async function loadUsers() {
  try {
    showLoading('users-table');
    usersList = await usersAPI.getAll();
    renderUsersTable();
  } catch (error) {
    showError('users-table', 'Failed to load users');
    console.error(error);
  }
}

function renderUsersTable() {
  const container = document.getElementById('users-table');
  if (!container) return;

  if (usersList.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>No users found</p></div>';
    return;
  }

  const rows = usersList.map(user => `
    <tr>
      <td>${user.user_id || user.id}</td>
      <td>${user.name || '-'}</td>
      <td>${user.email || '-'}</td>
      <td>${user.role || '-'}</td>
      <td>${formatDateShort(user.created_at)}</td>
      <td>
        <div class="action-buttons">
          <button class="btn-secondary" onclick="editUser(${user.user_id || user.id})">Edit</button>
          <button class="btn-danger" onclick="deleteUser(${user.user_id || user.id})">Delete</button>
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
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
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

function openAddUserModal() {
  editingUserId = null;
  document.getElementById('user-form').reset();
  document.getElementById('modalTitle').textContent = 'Add New User';
  openModal('userModal');
}

async function editUser(id) {
  try {
    const user = await usersAPI.getById(id);
    editingUserId = id;
    document.getElementById('name').value = user.name || '';
    document.getElementById('email').value = user.email || '';
    document.getElementById('role').value = user.role || 'student';
    document.getElementById('modalTitle').textContent = 'Edit User';
    openModal('userModal');
  } catch (error) {
    showNotification('Failed to load user', 'error');
    console.error(error);
  }
}

async function saveUser() {
  try {
    const data = {
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      role: document.getElementById('role').value
    };

    if (!data.name || !data.email || !data.role) {
      showNotification('Please fill in all fields', 'error');
      return;
    }

    if (editingUserId) {
      await usersAPI.update(editingUserId, data);
      showNotification('User updated successfully', 'success');
    } else {
      data.created_at = new Date().toISOString();
      await usersAPI.create(data);
      showNotification('User created successfully', 'success');
    }

    closeModal('userModal');
    loadUsers();
  } catch (error) {
    showNotification('Failed to save user', 'error');
    console.error(error);
  }
}

async function deleteUser(id) {
  if (confirm('Are you sure you want to delete this user?')) {
    try {
      await usersAPI.delete(id);
      showNotification('User deleted successfully', 'success');
      loadUsers();
    } catch (error) {
      showNotification('Failed to delete user', 'error');
      console.error(error);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadUsers();

  const userForm = document.getElementById('user-form');
  if (userForm) {
    userForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveUser();
    });
  }

  const closeBtn = document.getElementById('user-close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      closeModal('userModal');
    });
  }
});
