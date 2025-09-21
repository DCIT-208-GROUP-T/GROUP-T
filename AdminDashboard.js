const API_BASE_URL = 'http://localhost:3000/api';

const adminNameEl = document.getElementById('adminName');
const totalUsersCountEl = document.getElementById('totalUsersCount');
const activeLawyersCountEl = document.getElementById('activeLawyersCount');
const activeClientsCountEl = document.getElementById('activeClientsCount');
const openCasesCountEl = document.getElementById('openCasesCount');
const usersTableBody = document.querySelector('#usersTable tbody');

let currentUserData = null;

async function fetchData(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  if (!response.ok) {
    throw new Error(`Error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

async function loadAdminDashboard() {
  try {
    // Check user session
    const userSession = JSON.parse(localStorage.getItem('lawconnect_user') || sessionStorage.getItem('lawconnect_user'));

    console.log('Admin Dashboard - Session data:', userSession);

    if (!userSession) {
      console.log('No session found, redirecting to admin login');
      alert('No admin session found. Please log in as admin.');
      window.location.href = 'admin-login.html';
      return;
    }

    if (userSession.accountType !== 'admin') {
      console.log('User is not admin, account type:', userSession.accountType);
      alert('Access denied. Admin privileges required.');
      window.location.href = 'loginPage.html';
      return;
    }

    currentUserData = userSession;
    adminNameEl.textContent = currentUserData.fullName;

    console.log('Admin session validated, loading dashboard data...');

    // Fetch stats
    const [users, lawyers, clients, cases] = await Promise.all([
      fetchData('/users'),
      fetchData('/users/type/lawyer'),
      fetchData('/users/type/client'),
      fetchData('/cases')
    ]);

    totalUsersCountEl.textContent = users.length;
    activeLawyersCountEl.textContent = lawyers.length;
    activeClientsCountEl.textContent = clients.length;
    openCasesCountEl.textContent = cases.filter(c => ['active', 'pending', 'review'].includes(c.status)).length;

    populateUsersTable(users);
  } catch (error) {
    console.error('Error loading admin dashboard:', error);
    alert('Failed to load admin dashboard data.');
  }
}

function populateUsersTable(users) {
  usersTableBody.innerHTML = '';
  users.forEach(user => {
    const tr = document.createElement('tr');

    const statusText = user.isActive ? 'Active' : 'Deactivated';
    const statusClass = user.isActive ? 'status-active' : 'status-deactivated';

    tr.innerHTML = `
      <td>${user.fullName}</td>
      <td>${user.email}</td>
      <td>${user.accountType}</td>
      <td class="${statusClass}">${statusText}</td>
      <td>
        ${user.isActive ? `<button onclick="deactivateUser('${user._id}')">Deactivate</button>` : `<button onclick="activateUser('${user._id}')">Activate</button>`}
      </td>
    `;
    usersTableBody.appendChild(tr);
  });
}

async function deactivateUser(userId) {
  if (!confirm('Are you sure you want to deactivate this user?')) return;
  try {
    await fetchData(`/users/${userId}/deactivate`, { method: 'PUT' });
    alert('User deactivated successfully.');
    loadAdminDashboard();
  } catch (error) {
    console.error('Error deactivating user:', error);
    alert('Failed to deactivate user.');
  }
}

async function activateUser(userId) {
  if (!confirm('Are you sure you want to activate this user?')) return;
  try {
    // Assuming an activate endpoint or update user to isActive: true
    await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: true })
    });
    alert('User activated successfully.');
    loadAdminDashboard();
  } catch (error) {
    console.error('Error activating user:', error);
    alert('Failed to activate user.');
  }
}

function logout() {
  localStorage.removeItem('lawconnect_user');
  sessionStorage.removeItem('lawconnect_user');
  window.location.href = 'loginPage.html';
}

document.addEventListener('DOMContentLoaded', loadAdminDashboard);
