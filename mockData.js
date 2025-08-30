
const mockLawyerAppointments = [
    {
        id: 1,
        date: "2023-10-10",
        time: "10:00 AM",
        clientName: "John Doe",
        caseType: "Corporate Merger Agreement",
        lawyer: "Mr. Samuel Dompreh"
    },
    {
        id: 2,
        date: "2023-10-10",
        time: "2:30 PM",
        clientName: "Jane Smith",
        caseType: "Employment Dispute",
        lawyer: "Mr. Samuel Dompreh"
    }
];

const mockLawyerCases = [
    {
        id: 1,
        title: "Corporate Merger Agreement",
        status: "active",
        lawyerId: "lawyer1"
    },
    {
        id: 2,
        title: "Employment Dispute",
        status: "pending",
        lawyerId: "lawyer1"
    }
];

const mockMessages = [
    {
        id: 1,
        title: "New Message from Client",
        message: "Client has sent you a message regarding their case.",
        read: false,
        lawyerId: "lawyer1"
    },
    {
        id: 2,
        title: "New Document Uploaded",
        message: "A new document has been uploaded to your case.",
        read: true,
        lawyerId: "lawyer1"
    }
];

const mockInvoices = [
    {
        id: 1,
        amount: 5000,
        paid: false,
        lawyerId: "lawyer1"
    },
    {
        id: 2,
        amount: 3000,
        paid: true,
        lawyerId: "lawyer1"
    }
];

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        mockLawyerAppointments,
        mockLawyerCases,
        mockMessages,
        mockInvoices
    };
}

