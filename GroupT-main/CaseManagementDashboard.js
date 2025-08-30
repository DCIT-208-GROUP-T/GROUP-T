const API_BASE_URL = 'http://localhost:3000/api'; // API Base URL

// Mock documents data (will be replaced with Firestore data later)
const mockDocuments = [
  {
    id: 1,
    name: "Contract Draft v3.pdf",
    type: "pdf",
    date: "2024-07-10",
    caseId: 1
  },
  {
    id: 2,
    name: "Deposition Transcript.docx",
    type: "doc",
    date: "2024-07-05",
    caseId: 2
  },
  {
    id: 3,
    name: "Property Survey.png",
    type: "image",
    date: "2024-06-20",
    caseId: 3
  },
  {
    id: 4,
    name: "Court Order.pdf",
    type: "pdf",
    date: "2024-06-12",
    caseId: 4
  },
  {
    id: 5,
    name: "Client Declaration.docx",
    type: "doc",
    date: "2024-06-08",
    caseId: 1
  }
];

// DOM Elements
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

/**
 * Loads and displays the dashboard data.
 */
async function loadDashboard() {
  const userSession = JSON.parse(localStorage.getItem('lawconnect_user') || sessionStorage.getItem('lawconnect_user'));
  if (!userSession) {
    console.warn('No user session found. Redirecting to login.');
    window.location.href = 'loginPage.html';
    return;
  }

  try {
    // Fetch cases from API
    const response = await fetch(`${API_BASE_URL}/cases/client/${userSession._id}`);
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
    documentsCountEl.textContent = mockDocuments.length; // This will also need to be fetched from the API

    // Populate cases table
    renderCasesTable(filteredCases);

    // Populate recent documents
    renderDocumentsGrid(mockDocuments.slice(0, 5)); // Show only first 5 recent documents
  } catch (error) {
    console.error('Error loading dashboard data:', error);
  }
}

/**
 * Renders the cases in the table.
 * @param {Array} casesToRender The array of case objects to display.
 */
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

/**
 * Renders the recent documents in the grid.
 * @param {Array} documentsToRender The array of document objects to display.
 */
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

/**
 * Formats a date string into a more readable format.
 * @param {string} dateStr The date string to format (e.g., "YYYY-MM-DD").
 * @returns {string} The formatted date string.
 */
function formatDate(dateStr) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateStr).toLocaleDateString('en-US', options);
}

/**
 * Returns an emoji icon based on document type.
 * @param {string} type The type of the document (e.g., "pdf", "doc", "image").
 * @returns {string} An emoji representing the document type.
 */
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

/**
 * Simulates viewing a case.
 * @param {number} caseId The ID of the case to view.
 */
function viewCase(caseId) {
  alert(`Viewing case ID: ${caseId}\n\n(This would open a detailed case view in a real application.)`);
  // In a real app, navigate to a detailed case view page:
  // window.location.href = `case-details.html?id=${caseId}`;
}

/**
 * Simulates messaging a lawyer.
 * @param {string} lawyerName The name of the lawyer to message.
 */
function messageLawyer(lawyerName) {
  alert(`Opening message thread with ${lawyerName}.\n\n(This would link to a messaging interface.)`);
  // In a real app, navigate to the messages page with pre-selected recipient:
  // window.location.href = `messages.html?recipient=${encodeURIComponent(lawyerName)}`;
}

/**
 * Simulates viewing a document.
 * @param {number} docId The ID of the document to view.
 * @param {string} docName The name of the document.
 */
function viewDocument(docId, docName) {
  alert(`Opening document: "${docName}" (ID: ${docId})\n\n(This would open the document in a viewer or download it.)`);
  // In a real app, you might open a modal or navigate to a document viewer:
  // window.open(`document-viewer.html?id=${docId}`, '_blank');
}

// Event Listeners

// New case button handler
newCaseBtn.addEventListener('click', () => {
  alert('Initiating new case submission.\n\n(This would open a case intake form.)');
  // window.location.href = 'new-case-form.html';
});

// Filter tab switching
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

// Initial load of the dashboard when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', loadDashboard);
