# Lawyer Dashboard Backend Integration Plan

## Current Status
The Express.js backend is complete with comprehensive API endpoints, but the lawyer dashboard is using direct Firebase Firestore calls instead of the available API endpoints.

## Integration Steps

### 1. API Utility Functions
Create a utility module for API calls with proper error handling and authentication.

### 2. Update Data Fetching Functions
Replace all direct Firestore calls in `LawyerDashboard-enhanced.js` with API calls to:
- `/api/appointments/lawyer/:lawyerId` - Get lawyer's appointments
- `/api/cases/lawyer/:lawyerId` - Get lawyer's cases  
- `/api/messages` - Get unread messages (needs filtering by recipient)
- Invoice data (needs new endpoint or use existing data structure)

### 3. Authentication Headers
Add proper authentication headers to API requests using the user session data.

### 4. Error Handling
Implement comprehensive error handling for API failures with fallback to mock data.

### 5. Real-time Updates
Replace the current 5-minute polling with more efficient API-based polling or implement WebSocket connections.

## Files to Modify
- `LawyerDashboard-enhanced.js` - Main integration file
- `apiUtils.js` - New utility file for API calls (to be created)
- `mockData.js` - Update mock data structure to match API responses

## API Endpoints to Use
1. **Appointments**: `GET /api/appointments/lawyer/:lawyerId?upcoming=true`
2. **Cases**: `GET /api/cases/lawyer/:lawyerId` 
3. **Messages**: Need to check if messages endpoint supports filtering by recipient
4. **Invoices**: May need new endpoint or use existing data structure

## Testing Plan
1. Test each API endpoint individually
2. Test error handling and fallback mechanisms
3. Test authentication and authorization
4. Test performance with real data
5. Verify all dashboard functionality works with API integration

## Dependencies
- Ensure server is running on port 3000
- Verify MongoDB connection is working
- Test all API endpoints are accessible
