import firebaseConfig from './firebase-config.js';

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();

const API_BASE_URL = 'http://localhost:5000/api';

const clientNameEl = document.getElementById('clientName');
const activeCasesCountEl = document.getElementById('activeCasesCount');
const upcomingAppointmentsCountEl = document.getElementById('upcomingAppointmentsCount');
const documentsCountEl = document.getElementById('documentsCount');
const newMessagesCountEl = document.getElementById('newMessagesCount');
const notificationBadgeEl = document.getElementById('notificationBadge');
const upcomingClientAppointmentsEl = document.getElementById('upcomingClientAppointments');
const clientCasesEl = document.getElementById('clientCases');
const navItems = document.querySelectorAll('.nav-item');

let currentUserData = null;

async function fetchWithAuth(url, idToken) {
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${idToken}`
    }
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }
  return response.json();
}

async function fetchAppointments(idToken) {
  return fetchWithAuth(`${API_BASE_URL}/appointments/client`, idToken);
}

async function fetchCases(idToken) {
  return fetchWithAuth(`${API_BASE_URL}/cases/client`, idToken);
}

async function fetchDocuments(idToken) {
  return fetchWithAuth(`${API_BASE_URL}/documents`, idToken);
}

async function fetchMessages(idToken) {
  return fetchWithAuth(`${API_BASE_URL}/messages/user/${auth.currentUser.uid}/unread`, idToken);
}

async function fetchNotifications(idToken) {
  return fetchWithAuth(`${API_BASE_URL}/notifications`, idToken);
}

async function loadClientDashboard() {
  try {
    // Check user session
    const userSession = JSON.parse(localStorage.getItem('lawconnect_user') || sessionStorage.getItem('lawconnect_user'));

    if (!userSession || userSession.accountType !== 'client') {
      console.warn('No client session found. Redirecting to login.');
      window.location.href = 'loginPage.html';
      return;
    }

    currentUserData = userSession;
    clientNameEl.textContent = currentUserData.fullName || 'Client';

    // Get Firebase ID token for API auth
    const idToken = await auth.currentUser.getIdToken();

    // Load all dashboard data in parallel
    const [appointmentsData, casesData, documentsData, messagesData, notificationsData] = await Promise.all([
      fetchAppointments(idToken),
      fetchCases(idToken),
      fetchDocuments(idToken),
      fetchMessages(idToken),
      fetchNotifications(idToken)
    ]);

    // Update stats
    updateStats({
      activeCases: casesData.length,
      appointments: appointmentsData.length,
      documents: documentsData.length,
      messages: messagesData.length,
      notifications: notificationsData.length
    });

    // Render appointments
    renderAppointments(appointmentsData);

    // Render cases
    renderCases(casesData);

    // Set up event listeners
    setupEventListeners();

  } catch (error) {
    console.error("Error loading enhanced client dashboard:", error);
    showError("Failed to load dashboard data. Please check your internet connection.");
  }
}

async function fetchAppointments(idToken) {
  try {
    const response = await fetch(`${API_BASE_URL}/appointments/client/?upcoming=true`, {
      headers: {
        'Authorization': `Bearer ${idToken}`
      }
    });
    if (response.ok) {
      return await response.json();
    }
    return [];
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return [];
  }
}

async function fetchCases(idToken) {
  try {
    const response = await fetch(`${API_BASE_URL}/cases/client/`, {
      headers: {
        'Authorization': `Bearer ${idToken}`
      }
    });
    if (response.ok) {
      return await response.json();
    }
    return [];
  } catch (error) {
    console.error("Error fetching cases:", error);
    return [];
  }
}

async function fetchDocuments(idToken) {
  try {
    const response = await fetch(`${API_BASE_URL}/documents`, {
      headers: {
        'Authorization': `Bearer ${idToken}`
      }
    });
    if (response.ok) {
      return await response.json();
    }
    return [];
  } catch (error) {
    console.error("Error fetching documents:", error);
    return [];
  }
}

async function fetchMessages(idToken) {
  try {
    const response = await fetch(`${API_BASE_URL}/messages/user/${currentUserData.uid}/unread`, {
      headers: {
        'Authorization': `Bearer ${idToken}`
      }
    });
    if (response.ok) {
      return await response.json();
    }
    return [];
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
}

async function fetchNotifications(idToken) {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications?unreadOnly=true`, {
      headers: {
        'Authorization': `Bearer ${idToken}`
      }
    });
    if (response.ok) {
      const data = await response.json();
      return data.data || [];
    }
    return [];
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
}

function updateStats({ activeCases, appointments, documents, messages, notifications }) {
  activeCasesCountEl.textContent = activeCases;
  upcomingAppointmentsCountEl.textContent = appointments;
  documentsCountEl.textContent = documents;
  newMessagesCountEl.textContent = messages;
  notificationBadgeEl.textContent = notifications > 9 ? '9+' : notifications;
  notificationBadgeEl.style.display = notifications > 0 ? 'flex' : 'none';
}

function renderAppointments(appointments) {
  upcomingClientAppointmentsEl.innerHTML = '';

  if (appointments.length === 0) {
    upcomingClientAppointmentsEl.innerHTML = `
      <div class="agenda-item no-data">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#002f5c">
          <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm.5 11H12V7h1v6h3v1h-3.5z"/>
        </svg>
        <span>No appointments scheduled</span>
      </div>
    `;
    return;
  }

  appointments.forEach(appt => {
    const appointmentItem = document.createElement('div');
    appointmentItem.className = 'agenda-item';
    appointmentItem.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#002f5c">
        <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm.5 11H12V7h1v6h3v1h-3.5z"/>
      </svg>
      <div>
        <strong>${new Date(appt.date).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        })}, ${appt.time}</strong><br />
        Consultation with ${appt.lawyerId?.fullName || 'Your Lawyer'}<br />
        Topic: ${appt.caseId?.title || 'General Consultation'}
      </div>
    `;
    upcomingClientAppointmentsEl.appendChild(appointmentItem);
  });
}

function renderCases(cases) {
  clientCasesEl.innerHTML = '';

  if (cases.length === 0) {
    clientCasesEl.innerHTML = `
      <div class="case-item">
        <div class="case-info">
          <h4>No active cases</h4>
          <p>You don't have any active cases at the moment.</p>
        </div>
      </div>
    `;
    return;
  }

  cases.forEach(caseData => {
    const caseItem = document.createElement('div');
    caseItem.className = 'case-item';

    const statusClass = caseData.status === 'active' ? 'status-active' : 
                       caseData.status === 'pending' ? 'status-pending' : '';

    caseItem.innerHTML = `
      <div class="case-info">
        <h4>${caseData.title || 'Untitled Case'}</h4>
        <span class="case-status ${statusClass}">${caseData.status || 'Active'}</span>
        <p>Lawyer: ${caseData.lawyerId?.fullName || 'N/A'} • Last updated: ${new Date(caseData.updatedAt).toLocaleDateString()}</p>
      </div>
      <button class="case-action" onclick="viewCase('${caseData._id}')">View</button>
    `;
    clientCasesEl.appendChild(caseItem);
  });
}

function viewCase(caseId) {
  window.location.href = `CaseManagementDashboard.html?caseId=${caseId}`;
}

function setupEventListeners() {
  // Navigation items
  navItems.forEach((item, index) => {
    item.addEventListener('click', function() {
      navItems.forEach(nav => nav.classList.remove('active'));
      this.classList.add('active');

      switch(index) {
        case 0: // Dashboard
          // Already on dashboard
          break;
        case 1: // Messages
          window.location.href = 'client-messages.html';
          break;
        case 2: // Profile
          window.location.href = 'client-profile.html';
          break;
      }
    });
  });

  // Add real-time updates
  setupRealTimeUpdates();
}

function setupRealTimeUpdates() {
  // Simulate real-time updates (replace with actual Firebase listeners)
  setInterval(async () => {
    try {
      if (!auth.currentUser) {
        console.warn('User not authenticated for real-time updates');
        return;
      }
      const idToken = await auth.currentUser.getIdToken();
      const [messages, notifications] = await Promise.all([
        fetchMessages(idToken),
        fetchNotifications(idToken)
      ]);

      newMessagesCountEl.textContent = messages.length;
      notificationBadgeEl.textContent = notifications.length > 9 ? '9+' : notifications.length;
      notificationBadgeEl.style.display = notifications.length > 0 ? 'flex' : 'none';
    } catch (error) {
      console.error("Error in real-time update:", error);
    }
  }, 30000); // Update every 30 seconds
}

function showError(message) {
  // Create error toast notification
  const errorToast = document.createElement('div');
  errorToast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #e53e3e;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    max-width: 300px;
  `;
  errorToast.textContent = message;
  document.body.appendChild(errorToast);

  setTimeout(() => {
    errorToast.remove();
  }, 5000);
}

document.addEventListener('DOMContentLoaded', () => {
  auth.onAuthStateChanged((user) => {
    if (user) {
      loadClientDashboard();
    } else {
      console.warn('User not authenticated with Firebase. Redirecting to login.');
      window.location.href = 'loginPage.html';
    }
  });
});
