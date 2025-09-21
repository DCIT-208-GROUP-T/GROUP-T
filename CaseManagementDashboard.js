import firebaseConfig from './firebase-config.js';

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();

const API_BASE_URL = 'http://localhost:5000/api'; // API Base URL

const activeCountEl = document.getElementById('active-count');
const pendingCountEl = document.getElementById('pending-count');
const hearingCountEl = document.getElementById('hearing-count');
const documentsCountEl = document.getElementById('documents-count');
const casesTableBody = document.querySelector('#cases-table tbody');
const documentsGrid = document.getElementById('documents-grid');
const newCaseBtn = document.getElementById('new-case-btn');
const filterTabs = document.querySelectorAll('.filter-tab');
const noCasesMessage = casesTableBody.querySelector('.no-cases-message');
const noDocumentsMessage = documentsGrid.querySelector('.no-documents-message');

let currentFilter = 'all'; // Default filter

async function loadDashboard() {
  const userSession = JSON.parse(localStorage.getItem('lawconnect_user') || sessionStorage.getItem('lawconnect_user'));
  if (!userSession) {
    console.warn('No user session found. Redirecting to login.');
    window.location.href = 'loginPage.html';
    return;
  }

  try {
    // Get Firebase ID token for API auth
    const idToken = await auth.currentUser.getIdToken();

    // Fetch cases from API
    const response = await fetch(`${API_BASE_URL}/cases/client`, {
      headers: {
        'Authorization': `Bearer ${idToken}`
      }
    });
    const cases = await response.json();

    // Filter cases based on currentFilter
    const filteredCases = cases.filter(c => {
      if (currentFilter === 'all') return true;
      return c.status === currentFilter;
    });

    // Update stats
    const activeCases = cases.filter(c => c.status !== 'completed');
    const pendingReviewCases = cases.filter(c => c.status === 'review');
    const upcomingHearings = cases.filter(c => c.hearingDate && new Date(c.hearingDate) > new Date());

    activeCountEl.textContent = activeCases.length;
    pendingCountEl.textContent = pendingReviewCases.length;
    hearingCountEl.textContent = upcomingHearings.length;

    // Fetch documents from API
    const documentsResponse = await fetch(`${API_BASE_URL}/documents`, {
      headers: {
        'Authorization': `Bearer ${idToken}`
      }
    });
    const documents = documentsResponse.ok ? await documentsResponse.json() : [];
    documentsCountEl.textContent = documents.length;

    // Populate cases table
    renderCasesTable(filteredCases);

    // Populate recent documents
    renderDocumentsGrid(documents.slice(0, 5)); // Show only first 5 recent documents
  } catch (error) {
    console.error('Error loading dashboard data:', error);
  }
}



function renderCasesTable(casesToRender) {
  casesTableBody.innerHTML = ''; // Clear existing rows

  if (casesToRender.length === 0) {
    const noCasesRow = document.createElement('tr');
    noCasesRow.innerHTML = `<td colspan="5" class="no-cases-message">No cases to display for this filter.</td>`;
    casesTableBody.appendChild(noCasesRow);
    return;
  }

  casesToRender.forEach(c => {
    const row = document.createElement('tr');
    row.setAttribute('role', 'row');

    let statusClass = 'status-active';
    if (c.status === 'review') statusClass = 'status-review';
    if (c.status === 'pending') statusClass = 'status-pending';
    if (c.status === 'completed') statusClass = 'status-completed';

    const lawyerName = c.lawyerId ? c.lawyerId.fullName : 'Unassigned';
    const updatedDate = c.updatedAt || c.createdAt;

    row.innerHTML = `
      <td data-label="Case Title">
        <div class="case-title">${c.title}</div>
        <div class="case-lawyer">${lawyerName}</div>
      </td>
      <td data-label="Assigned Lawyer">${lawyerName}</td>
      <td data-label="Last Updated">${formatDate(updatedDate)}</td>
      <td data-label="Status"><span class="status-badge ${statusClass}">${c.status.toUpperCase()}</span></td>
      <td data-label="Actions">
        <button type="button" class="action-btn" onclick="viewCase('${c._id}')" aria-label="View details for case ${c.title}">View</button>
        <button type="button" class="action-btn" onclick="messageLawyer('${lawyerName}')" aria-label="Message ${lawyerName}">Message</button>
      </td>
    `;
    casesTableBody.appendChild(row);
  });
}

function renderDocumentsGrid(documentsToRender) {
  documentsGrid.innerHTML = ''; // Clear existing documents

  if (documentsToRender.length === 0) {
    const noDocsMessage = document.createElement('p');
    noDocsMessage.className = 'no-documents-message';
    noDocsMessage.textContent = 'No recent documents to display.';
    documentsGrid.appendChild(noDocsMessage);
    return;
  }

  documentsToRender.forEach(d => {
    const docCard = document.createElement('div');
    docCard.className = 'doc-card';
    docCard.setAttribute('role', 'listitem');
    docCard.setAttribute('tabindex', '0'); // Make document cards focusable
    docCard.setAttribute('aria-label', `Document: ${d.name}, uploaded on ${formatDate(d.date)}`);
    docCard.innerHTML = `
      <div class="doc-thumbnail" aria-hidden="true">
        ${getDocIcon(d.type)}
      </div>
      <div class="doc-info">
        <p class="doc-name">${d.name}</p>
        <p class="doc-date">${formatDate(d.date)}</p>
      </div>
    `;
    docCard.addEventListener('click', () => viewDocument(d.id, d.name));
    documentsGrid.appendChild(docCard);
  });
}

function formatDate(dateStr) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateStr).toLocaleDateString('en-US', options);
}

function getDocIcon(type) {
  const icons = {
    'pdf': '📄',
    'doc': '📝',
    'image': '🖼️',
    'spreadsheet': '📊',
    'presentation': ' स्लाइड्स',
    'folder': '📁'
  };
  return icons[type] || '📋'; // Default clipboard icon
}

function viewCase(caseId) {
  alert(`Viewing case ID: ${caseId}\n\n(This would open a detailed case view in a real application.)`);
  // In a real app, navigate to a detailed case view page:
  // window.location.href = `case-details.html?id=${caseId}`;
}

function messageLawyer(lawyerName) {
  alert(`Opening message thread with ${lawyerName}.\n\n(This would link to a messaging interface.)`);
  // In a real app, navigate to the messages page with pre-selected recipient:
  // window.location.href = `messages.html?recipient=${encodeURIComponent(lawyerName)}`;
}

function viewDocument(docId, docName) {
  alert(`Opening document: "${docName}" (ID: ${docId})\n\n(This would open the document in a viewer or download it.)`);
  // In a real app, you might open a modal or navigate to a document viewer:
  // window.open(`document-viewer.html?id=${docId}`, '_blank');
}

newCaseBtn.addEventListener('click', () => {
  alert('Initiating new case submission.\n\n(This would open a case intake form.)');
  // window.location.href = 'new-case-form.html';
});

filterTabs.forEach(tab => {
  tab.addEventListener('click', function() {
    // Remove 'active' class from all tabs
    filterTabs.forEach(t => t.classList.remove('active'));
    // Add 'active' class to the clicked tab
    this.classList.add('active');

    // Update current filter and reload dashboard
    currentFilter = this.dataset.filter;
    loadDashboard();
  });
});

document.addEventListener('DOMContentLoaded', () => {
  auth.onAuthStateChanged((user) => {
    if (user) {
      loadDashboard();
    } else {
      console.warn('User not authenticated with Firebase. Redirecting to login.');
      window.location.href = 'loginPage.html';
    }
  });
});

