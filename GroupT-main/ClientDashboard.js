// Enhanced Client Dashboard JavaScript
const firebaseConfig = {
  apiKey: "AIzaSyAlyIP81ut-Stj6Uyf123SOTNThfnNxYOs",
  authDomain: "lawconnect-swe2547.firebaseapp.com",
  projectId: "lawconnect-swe2547",
  storageBucket: "lawconnect-swe2547.firebasestorage.app",
  messagingSenderId: "584082304319",
  app极Id: "1:584082304319:web:106b26321b34f64ac9b78a"
};

// Initialize Firebase for authentication only
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();

// API Base URL
const API_BASE_URL = 'http://localhost:3000/api';

// DOM Elements
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

/**
 * Enhanced client dashboard loader with professional UI integration
 */
async function loadEnhancedClientDashboard() {
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

    // Load all dashboard data in parallel
    const [appointmentsData, casesData, documentsData, messagesData, notificationsData] = await Promise.all([
      fetchAppointments(),
      fetchCases(),
      fetchDocuments(),
      fetchMessages(),
      fetchNotifications()
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

/**
 * Fetch appointments from API
 */
async function fetchAppointments() {
  try {
    const response = await fetch(`${API_BASE_URL}/appointments/client/${currentUserData._id}?upcoming=true`);
    if (response.ok) {
      return await response.json();
    }
    return [];
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return [];
  }
}

/**
 * Fetch cases from API
 */
async function fetchCases() {
  try {
    const response = await fetch(`${API_BASE_URL}/cases/client/${currentUserData._id}`);
    if (response.ok) {
      return await response.json();
    }
    return [];
  } catch (error) {
    console.error("Error fetching cases:", error);
    return [];
  }
}

/**
 * Fetch documents from API
 */
async function fetchDocuments() {
  try {
    const response = await fetch(`${API_BASE_URL}/documents/client/${currentUserData._id}`);
    if (response.ok) {
      return await response.json();
    }
    return [];
  } catch (error) {
    console.error("Error fetching documents:", error);
    return [];
  }
}

/**
 * Fetch messages from API
 */
async function fetchMessages() {
  try {
    const response = await fetch(`${API_BASE_URL}/messages/client/${currentUserData._id}?unread=true`);
    if (response.ok) {
      return await response.json();
    }
    return [];
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
}

/**
 * Fetch notifications from API
 */
async function fetchNotifications() {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/client/${currentUserData._id}?unread=true`);
    if (response.ok) {
      return await response.json();
    }
    return [];
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
}

/**
 * Update dashboard statistics
 */
function updateStats({ activeCases, appointments, documents, messages, notifications }) {
  activeCasesCountEl.textContent = activeCases;
  upcomingAppointmentsCountEl.textContent = appointments;
  documentsCountEl.textContent = documents;
  newMessagesCountEl.textContent = messages;
  notificationBadgeEl.textContent = notifications > 9 ? '9+' : notifications;
  notificationBadgeEl.style.display = notifications > 0 ? 'flex' : 'none';
}

/**
 * Render appointments list
 */
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
        Topic: ${appt.case极Id?.title || 'General Consultation'}
      </div>
    `;
    upcomingClientAppointmentsEl.appendChild(appointmentItem);
  });
}

/**
 * Render cases list
 */
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

/**
 * View case details
 */
function viewCase(caseId) {
  window.location.href = `CaseManagementDashboard.html?caseId=${caseId}`;
}

/**
 * Setup event listeners
 */
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
          window.location.href = 'Message.html';
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

/**
 * Setup real-time updates
 */
function setupRealTimeUpdates() {
  // Simulate real-time updates (replace with actual Firebase listeners)
  setInterval(async () => {
    try {
      const [messages, notifications] = await Promise.all([
        fetchMessages(),
        fetchNotifications()
      ]);
      
      newMessagesCountEl.textContent = messages.length;
      notificationBadgeEl.textContent = notifications.length > 9 ? '9+' : notifications.length;
      notificationBadgeEl.style.display = notifications.length > 0 ? 'flex' : 'none';
    } catch (error) {
      console.error("Error in real-time update:", error);
    }
  }, 30000); // Update every 30 seconds
}

/**
 * Show error message
 */
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

/**
 * Initialize dashboard when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', loadEnhancedClientDashboard);

// Export functions for global access
window.viewCase = viewCase;
