// Notifications API Service
class NotificationsService {
    constructor() {
        this.baseUrl = '/api/notifications';
        this.currentUser = null;
    }

    // Initialize the service with current user
    async initialize() {
        try {
            // Get current user from localStorage or session
            const userData = localStorage.getItem('currentUser');
            if (userData) {
                this.currentUser = JSON.parse(userData);
                return true;
            }
            
            // If no user in localStorage, try to get from Firebase auth
            if (typeof firebase !== 'undefined' && firebase.auth().currentUser) {
                const firebaseUser = firebase.auth().currentUser;
                // Fetch user data from backend
                const response = await fetch(`/api/users/firebase/${firebaseUser.uid}`);
                if (response.ok) {
                    this.currentUser = await response.json();
                    localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                    return true;
                }
            }
            
            console.warn('No authenticated user found');
            return false;
        } catch (error) {
            console.error('Error initializing notifications service:', error);
            return false;
        }
    }

    // Get all notifications for current user
    async getNotifications(options = {}) {
        try {
            const { limit = 50, skip = 0, unreadOnly = false, type = null } = options;
            
            const params = new URLSearchParams();
            params.append('limit', limit);
            params.append('skip', skip);
            if (unreadOnly) params.append('unreadOnly', 'true');
            if (type) params.append('type', type);

            const response = await fetch(`${this.baseUrl}?${params.toString()}`, {
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw error;
        }
    }

    // Get unread notifications count
    async getUnreadCount() {
        try {
            const response = await fetch(`${this.baseUrl}/unread-count`, {
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.data.count;
        } catch (error) {
            console.error('Error fetching unread count:', error);
            return 0;
        }
    }

    // Mark notifications as read
    async markAsRead(notificationIds = null) {
        try {
            const response = await fetch(`${this.baseUrl}/mark-read`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getAuthHeaders()
                },
                body: JSON.stringify({ notificationIds })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error marking notifications as read:', error);
            throw error;
        }
    }

    // Mark single notification as read
    async markNotificationAsRead(notificationId) {
        try {
            const response = await fetch(`${this.baseUrl}/${notificationId}/read`, {
                method: 'PUT',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    }

    // Delete notification
    async deleteNotification(notificationId) {
        try {
            const response = await fetch(`${this.baseUrl}/${notificationId}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error deleting notification:', error);
            throw error;
        }
    }

    // Clear all notifications
    async clearAllNotifications() {
        try {
            const response = await fetch(this.baseUrl, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error clearing notifications:', error);
            throw error;
        }
    }

    // Get authentication headers
    getAuthHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };

        // Add user ID header if available
        if (this.currentUser && this.currentUser._id) {
            headers['x-user-id'] = this.currentUser._id;
        }

        return headers;
    }

    // Format time for display
    formatTime(timestamp) {
        const now = new Date();
        const notificationTime = new Date(timestamp);
        const diffInSeconds = Math.floor((now - notificationTime) / 1000);
        
        if (diffInSeconds < 60) {
            return 'Just now';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
        } else if (diffInSeconds < 604800) {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} day${days !== 1 ? 's' : ''} ago`;
        } else {
            return notificationTime.toLocaleDateString();
        }
    }

    // Get type class for styling
    getTypeClass(type) {
        const typeClasses = {
            'case': 'type-case',
            'appointment': 'type-appointment',
            'message': 'type-message',
            'payment': 'type-payment',
            'system': 'type-system',
            'document': 'type-document'
        };
        return typeClasses[type] || 'type-system';
    }
}

// Initialize notifications service
const notificationsService = new NotificationsService();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = notificationsService;
}
