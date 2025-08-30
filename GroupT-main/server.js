const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet'); // For basic security headers
const morgan = require('morgan'); // For request logging
const connectDB = require('./config/database');
const config = require('./config');

const app = express();
const PORT = config.PORT;

// Connect to MongoDB
connectDB();

const rateLimit = require('express-rate-limit');

// --- Rate Limiting Middleware ---
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// --- Middleware ---
app.use(limiter);
// Enable CORS for all origins (for development, restrict in production)
app.use(cors());

// Set Content Security Policy
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "script-src 'self' https://www.gstatic.com https://*.firebaseio.com; object-src 'none';");
  next();
});

// Add basic security headers
app.use(helmet());

// HTTP request logger middleware
app.use(morgan('dev')); // 'dev' format provides concise output colored by status

// Parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the current directory (where server.js is located)
// This makes all files in the project root accessible directly.
app.use(express.static(path.join(__dirname)));

app.get('/settings', (req, res) => {
    console.log('Serving settings.html');
    res.sendFile(path.join(__dirname, 'settings.html'));
});

// --- API Routes ---
app.use('/api/users', require('./routes/users'));
app.use('/api/cases', require('./routes/cases'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/payments', require('./routes/payments'));

// --- Routes for your application pages ---

// Root route - Landing page
app.get('/', (req, res) => {
    console.log('Serving index.html');
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Signup page
app.get('/signup', (req, res) => {
    console.log('Serving SignupPage.html');
    res.sendFile(path.join(__dirname, 'SignupPage.html'));
});

// Account type selection page
app.get('/account-type', (req, res) => {
    console.log('Serving accTypeInterface.html');
    res.sendFile(path.join(__dirname, 'accTypeInterface.html'));
});

// Login page
app.get('/login', (req, res) => {
    console.log('Serving loginPage.html');
    res.sendFile(path.join(__dirname, 'loginPage.html'));
});

// Client Dashboard
app.get('/client-dashboard', (req, res) => {
    console.log('Serving ClientDashboard.html');
    res.sendFile(path.join(__dirname, 'ClientDashboard.html'));
});

// Lawyer Dashboard
app.get('/lawyer-dashboard', (req, res) => {
    console.log('Serving LawyerDashboard.html');
    res.sendFile(path.join(__dirname, 'LawyerDashboard.html'));
});

// Book Appointment page
app.get('/book-appointment', (req, res) => {
    console.log('Serving BookAppointment.html');
    res.sendFile(path.join(__dirname, 'BookAppointment.html'));
});

// Case Management Dashboard (for lawyers)
app.get('/case-management', (req, res) => {
    console.log('Serving CaseManagementDashboard.html');
    res.sendFile(path.join(__dirname, 'CaseManagementDashboard.html'));
});

// Messages page
app.get('/messages', (req, res) => {
    console.log('Serving Message.html');
    res.sendFile(path.join(__dirname, 'Message.html'));
});

// Notifications page
app.get('/notifications', (req, res) => {
    console.log('Serving notifications.html');
    res.sendFile(path.join(__dirname, 'notifications.html'));
});

// --- Error Handling ---

// Catch-all for 404 Not Found
app.use((req, res, next) => {
    console.warn(`404 Not Found: ${req.method} ${req.originalUrl}`);
    res.status(404).sendFile(path.join(__dirname, '404.html')); // Serve a custom 404 page
});

// General error handling middleware
app.use((err, req, res, next) => {
    console.error('Server Error:', err.stack);
    res.status(500).sendFile(path.join(__dirname, '500.html')); // Serve a custom 500 page
});

// --- Server Start ---
app.listen(PORT, () => {
    console.log(`LawConnect server running on http://localhost:${PORT}`);
    console.log(`Access your app at: http://localhost:${PORT}`);
});
