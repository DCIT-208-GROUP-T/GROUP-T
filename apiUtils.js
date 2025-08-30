const API_BASE_URL = 'http://localhost:3000/api';

async function fetchData(endpoint, options = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    return response.json();
}

async function getLawyerAppointments(lawyerId) {
    return fetchData(`/appointments/lawyer/${lawyerId}?upcoming=true`);
}

async function getLawyerCases(lawyerId) {
    return fetchData(`/cases/lawyer/${lawyerId}`);
}

async function getUnreadMessages(userId) {
    return fetchData(`/messages?recipientId=${userId}`);
}

async function getLawyerInvoices(lawyerId) {
    return fetchData(`/invoices/lawyer/${lawyerId}`);
}

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

