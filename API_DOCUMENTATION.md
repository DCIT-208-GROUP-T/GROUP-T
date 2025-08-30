# LawConnect API Documentation

## Base URL
`http://localhost:3000/api`

## Authentication
All API endpoints require proper authentication. User ID should be passed in the `x-user-id` header for role-based access control.

## Rate Limiting
- **Limit**: 100 requests per 15 minutes per IP address
- **Middleware**: express-rate-limit
- **Error Response**: `429 Too Many Requests` with message "Too many requests from this IP, please try again later."

## User Management Endpoints

### Get All Users
- **Endpoint**: `GET /users`
- **Description**: Retrieve all users
- **Response**: Array of user objects

### Get User by ID
- **Endpoint**: `GET /users/:id`
- **Description**: Retrieve a specific user by ID
- **Response**: User object

### Get User by Firebase UID
- **Endpoint**: `GET /users/firebase/:uid`
- **Description**: Retrieve a user by Firebase UID
- **Response**: User object

### Create User
- **Endpoint**: `POST /users`
- **Description**: Create a new user after Firebase authentication
- **Request Body**:
  ```json
  {
    "firebaseUid": "string",
    "email": "string",
    "fullName": "string",
    "accountType": "client|lawyer|admin",
    "phoneNumber": "string",
    "profilePicture": "string"
  }
  ```
- **Response**: Created user object

### Update User
- **Endpoint**: `PUT /users/:id`
- **Description**: Update user information
- **Request Body**: Any user fields to update
- **Response**: Updated user object

### Delete User
- **Endpoint**: `DELETE /users/:id`
- **Description**: Delete a user permanently
- **Response**: `{ "message": "User deleted successfully" }`

### Get Users by Account Type
- **Endpoint**: `GET /users/type/:accountType`
- **Description**: Get users filtered by account type
- **Response**: Array of user objects

### Deactivate User
- **Endpoint**: `PUT /users/:id/deactivate`
- **Description**: Deactivate a user account (sets isActive to false)
- **Response**: `{ "message": "User deactivated successfully" }`

### Update User Profile
- **Endpoint**: `PUT /users/profile/:id`
- **Description**: Update user profile information including profile picture
- **Request Body**:
  ```json
  {
    "fullName": "string",
    "phoneNumber": "string",
    "profilePicture": "string"
  }
  ```
- **Response**: Updated user object

## Case Management Endpoints

### Get All Cases
- **Endpoint**: `GET /cases`
- **Description**: Retrieve all cases
- **Response**: Array of case objects with populated client and lawyer information

### Get Case by ID
- **Endpoint**: `GET /cases/:id`
- **Description**: Retrieve a specific case by ID
- **Response**: Case object with populated client and lawyer information

### Get Cases by Client ID
- **Endpoint**: `GET /cases/client/:clientId`
- **Description**: Retrieve cases for a specific client
- **Response**: Array of case objects

### Get Cases by Lawyer ID
- **Endpoint**: `GET /cases/lawyer/:lawyerId`
- **Description**: Retrieve cases for a specific lawyer
- **Response**: Array of case objects

### Create Case
- **Endpoint**: `POST /cases`
- **Access**: Lawyers and Admins only
- **Request Body**:
  ```json
  {
    "title": "string",
    "description": "string",
    "clientId": "string",
    "lawyerId": "string",
    "caseType": "string",
    "priority": "string"
  }
  ```
- **Response**: Created case object with populated client and lawyer information

### Update Case
- **Endpoint**: `PUT /cases/:id`
- **Description**: Update case information
- **Request Body**: Any case fields to update
- **Response**: Updated case object

### Delete Case
- **Endpoint**: `DELETE /cases/:id`
- **Access**: Lawyers and Admins only
- **Response**: `{ "message": "Case deleted successfully" }`

### Add Document to Case
- **Endpoint**: `POST /cases/:id/documents`
- **Request Body**:
  ```json
  {
    "name": "string",
    "url": "string"
  }
  ```
- **Response**: Added document object

### Add Note to Case
- **Endpoint**: `POST /cases/:id/notes`
- **Request Body**:
  ```json
  {
    "content": "string",
    "createdBy": "string"
  }
  ```
- **Response**: Added note object

### Get Cases by Status
- **Endpoint**: `GET /cases/status/:status`
- **Description**: Retrieve cases filtered by status
- **Response**: Array of case objects

## Notifications Endpoints

### Get User Notifications
- **Endpoint**: `GET /notifications`
- **Description**: Retrieve notifications for authenticated user
- **Query Parameters**:
  - `limit`: Number of notifications to return (default: 50)
  - `skip`: Number of notifications to skip (default: 0)
  - `unreadOnly`: Boolean to filter only unread notifications
  - `type`: Filter by notification type
- **Response**: Array of notification objects with pagination info

### Get Unread Notifications Count
- **Endpoint**: `GET /notifications/unread-count`
- **Description**: Get count of unread notifications for authenticated user
- **Response**: Object with count property

### Mark Notifications as Read
- **Endpoint**: `PUT /notifications/mark-read`
- **Description**: Mark notifications as read (all or specific ones)
- **Request Body**:
  ```json
  {
    "notificationIds": ["array", "of", "notification", "ids"] // Optional, marks all if not provided
  }
  ```
- **Response**: Success message

### Mark Single Notification as Read
- **Endpoint**: `PUT /notifications/:id/read`
- **Description**: Mark a specific notification as read
- **Response**: Success message

### Delete Notification
- **Endpoint**: `DELETE /notifications/:id`
- **Description**: Delete a specific notification
- **Response**: Success message

### Clear All Notifications
- **Endpoint**: `DELETE /notifications`
- **Description**: Delete all notifications for authenticated user
- **Response**: Success message

### Create Notification
- **Endpoint**: `POST /notifications`
- **Description**: Create a new notification (typically for internal use)
- **Request Body**:
  ```json
  {
    "title": "string",
    "message": "string",
    "type": "case|appointment|message|payment|system|document",
    "relatedEntityId": "string", // Optional
    "relatedEntityType": "Case|Appointment|Message|Invoice", // Optional
    "priority": "low|medium|high|urgent", // Optional
    "actionUrl": "string", // Optional
    "metadata": {} // Optional
  }
  ```
- **Response**: Created notification object

## Role-Based Access Control

### Available Roles
- `client`: Regular client users
- `lawyer`: Legal professionals with case management permissions
- `admin`: Administrative users with full system access

### Protected Endpoints
- **Case Creation** (`POST /cases`): Lawyers and Admins only
- **Case Deletion** (`DELETE /cases/:id`): Lawyers and Admins only
- **Notification Creation** (`POST /notifications`): Typically for internal/system use

### Middleware Usage
```javascript
const { requireRole } = require('./middleware/auth');

// Apply to specific routes
router.post('/cases', requireRole(['lawyer', 'admin']), async (req, res) => {
  // Route handler
});
```

## Error Responses

### Common HTTP Status Codes
- `200 OK`: Successful request
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

### Error Response Format
```json
{
  "message": "Error description"
}
```

## Security Features

### Content Security Policy
- Script sources restricted to self, gstatic.com, and firebaseio.com
- Object sources disabled for enhanced security

### Security Headers
- Helmet.js middleware for basic security headers
- CORS enabled for all origins (development only)

### User Account Security
- User deactivation instead of permanent deletion
- Account status checking in role-based access control
- Timestamp tracking for last login and updates
