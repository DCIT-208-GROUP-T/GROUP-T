const API_BASE_URL = 'http://localhost:3000/api';

// Function to fetch data from the API
async function fetchData(endpoint, options = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    return response.json();
}

// Function to get appointments for a lawyer
async function getLawyerAppointments(lawyerId) {
    return fetchData(`/appointments/lawyer/${lawyerId}?upcoming=true`);
}

// Function to get cases for a lawyer
async function getLawyerCases(lawyerId) {
    return fetchData(`/cases/lawyer/${lawyerId}`);
}

// Function to get unread messages
async function getUnreadMessages(userId) {
    return fetchData(`/messages?recipientId=${userId}`);
}

// Function to get invoices (if needed)
async function getLawyerInvoices(lawyerId) {
    return fetchData(`/invoices/lawyer/${lawyerId}`);
}

// Function to verify payment with backend
async function verifyPayment(paymentData) {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
    };
    
    return fetchData('/payments/verify', options);
}

export { getLawyerAppointments, getLawyerCases, getUnreadMessages, getLawyerInvoices, verifyPayment };
