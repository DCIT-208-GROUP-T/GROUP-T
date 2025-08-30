// API Base URL
const API_BASE_URL = 'http://localhost:3000/api';

// DOM Elements
const welcomeMessageEl = document.getElementById('welcomeMessage');
const openCasesCountEl = document.getElementById('openCasesCount');
const scheduledCountEl = document.getElementById('scheduledCount');
const unreadCountEl = document.getElementById('unreadCount');
const unpaidAmountEl = document.getElementById('unpaidAmount');
const todaysAgendaEl = document.getElementById('todaysAgenda');
const navItems = document.querySelectorAll('.nav-item');
const lawyerNameEl = document.getElementById('lawyerName');
const notificationBadgeEl = document.getElementById('notificationBadge');
const searchContainer = document.getElementById('searchContainer');
const searchInput = document.getElementById('searchInput');

let currentUserData = null;
let revenueChart = null;

// Utility Functions
function toggleSearch() {
  searchContainer.style.display = searchContainer.style.display === 'none' ? 'flex' : 'none';
  if (searchContainer.style.display === 'flex') {
    searchInput.focus();
  }
}

function toggleTheme() {
  document.body.classList.toggle('dark-theme');
  // Save theme preference to localStorage
  const isDark = document.body.classList.contains('dark-theme');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

function openCreateCaseModal() {
  const caseTitle = prompt('Enter case title:');
  if (!caseTitle) return;

  try {
    // Implementation for creating a new case
    alert(`Case "${caseTitle}" created successfully!`);
    loadLawyerDashboard(); // Refresh the dashboard
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to create case');
  }
}

function viewCase(caseId) {
  window.location.href = `CaseManagementDashboard.html?case=${caseId}`;
}

function updateAnalytics(timeframe) {
  // Simulate analytics data based on timeframe
  const data = {
    week: [1200, 1900, 3000, 5000, 2000, 3000, 4000],
    month: [5000, 7000, 6000, 8000, 9000, 10000, 12000, 11000, 13000, 15000],
    quarter: [25000, 30000, 35000, 40000]
  };

  if (revenueChart) {
    revenueChart.destroy();
  }

  const ctx = document.getElementById('revenueChart').getContext('2d');
  revenueChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: timeframe === 'week' 
        ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        : timeframe === 'month'
        ? Array.from({length: 10}, (_, i) => `Week ${i + 1}`)
        : ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [{
        label: 'Revenue ($)',
        data: data[timeframe],
        borderColor: '#002f5c',
        backgroundColor: 'rgba(0, 47, 92, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        },
        x: {
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        }
      }
    }
  });
}

// API utility functions
async function fetchData(endpoint, options = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    return response.json();
}

// Load lawyer dashboard data
async function loadLawyerDashboard() {
  const userSession = JSON.parse(localStorage.getItem('lawconnect_user') || sessionStorage.getItem('lawconnect_user'));

  if (!userSession || userSession.accountType !== 'lawyer') {
    console.warn('No lawyer session found. Redirecting to login.');
    window.location.href = 'loginPage.html';
    return;
  }

  currentUserData = userSession;
  lawyerNameEl.textContent = currentUserData.fullName;

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of today

  try {
    // Fetch Today's Appointments using API
    const appointments = await fetchData(`/appointments/lawyer/${currentUserData.uid}?upcoming=true`);
    const appointmentsForToday = appointments.filter(appt => 
      appt.date === today.toISOString().split('T')[0] && appt.status === 'scheduled'
    );
    
    todaysAgendaEl.innerHTML = ''; // Clear existing agenda items
    
    if (appointmentsForToday.length === 0) {
      todaysAgendaEl.innerHTML = '<div class="agenda-item no-data">No appointments scheduled for today.</div>';
      scheduledCountEl.textContent = '0';
    } else {
      appointmentsForToday.forEach(appt => {
        const agendaItem = document.createElement('div');
        agendaItem.className = 'agenda-item';
        agendaItem.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#002f5c">
            <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm.5 11H12V7h1v6h3v1h-3.5z"/>
          </svg>
          <div>
            <strong>${appt.time}</strong> - ${appt.clientName || 'Client'}<br>
            <small>${appt.caseType}</small>
          </div>
        `;
        todaysAgendaEl.appendChild(agendaItem);
      });
      scheduledCountEl.textContent = appointmentsForToday.length;
    }

    // Fetch Open Cases using API
    const cases = await fetchData(`/cases/lawyer/${currentUserData.uid}`);
    const openCases = cases.filter(caseData => 
      ['active', 'pending', 'review'].includes(caseData.status)
    );
    openCasesCountEl.textContent = openCases.length;

    // Fetch Unread Messages using API
    const unreadMessages = await fetchData(`/messages/user/${currentUserData.uid}/unread`);
    unreadCountEl.textContent = unreadMessages.length;
    notificationBadgeEl.textContent = unreadMessages.length;

    // Fetch Invoices using API (fallback to mock data if endpoint not available)
    let totalUnpaid = 8500; // Default mock value
    try {
      const invoices = await fetchData(`/invoices/lawyer/${currentUserData.uid}`);
      totalUnpaid = invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
    } catch (error) {
      console.log("Invoice endpoint not available, using mock data:", error.message);
      // Use mock data for demonstration
      const mockInvoices = [
        { amount: 2500 },
        { amount: 3500 },
        { amount: 2500 }
      ];
      totalUnpaid = mockInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
    }
    unpaidAmountEl.textContent = `$${totalUnpaid.toLocaleString()}`;

    // Initialize analytics chart
    updateAnalytics('month');

  } catch (error) {
    console.error("Error loading lawyer dashboard data:", error);
    // Fallback to mock data for demonstration
    loadMockData();
  }
}

// Fallback to mock data
function loadMockData() {
  const today = new Date();
  const mockAppointments = [
    { time: '10:00 AM', clientName: 'John Doe', caseType: 'Corporate Merger' },
    { time: '2:30 PM', clientName: 'Jane Smith', caseType: 'Employment Dispute' }
  ];

  todaysAgendaEl.innerHTML = '';
  mockAppointments.forEach(appt => {
    const agendaItem = document.createElement('div');
    agendaItem.className = 'agenda-item';
    agendaItem.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#002f5c">
        <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm.5 11H12V7h1v6h3v1h-3.5z"/>
      </svg>
      <div>
        <strong>${appt.time}</strong> - ${appt.clientName}<br>
        <small>${appt.caseType}</small>
      </div>
    `;
    todaysAgendaEl.appendChild(agendaItem);
  });

  openCasesCountEl.textContent = '12';
  scheduledCountEl.textContent = mockAppointments.length;
  unreadCountEl.textContent = '5';
  notificationBadgeEl.textContent = '5';
  unpaidAmountEl.textContent = '$8,500';

  updateAnalytics('month');
}

// Event Listeners
navItems.forEach((item, index) => {
  item.addEventListener('click', function() {
    navItems.forEach(nav => nav.classList.remove('active'));
    this.classList.add('active');

    switch(index) {
      case 0: // Dashboard
        break;
      case 1: // Cases
        window.location.href = 'CaseManagementDashboard.html';
        break;
      case 2: // Calendar
        window.location.href = 'Bookappointment.html';
        break;
      case 3: // Messages
        window.location.href = 'Message.html';
        break;
      case 4: // Profile
        window.location.href = 'lawyer-profile.html';
        break;
    }
  });
});

// Search functionality
searchInput.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    alert(`Searching for: ${this.value}`);
    this.value = '';
    toggleSearch();
  }
});

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
  // Load saved theme
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
  }

  loadLawyerDashboard();
});

// Real-time updates
setInterval(loadLawyerDashboard, 300000); // Refresh every 5 minutes
