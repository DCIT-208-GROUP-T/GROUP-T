const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('../config/database');
const config = require('../config');
const admin = require('firebase-admin');
const serviceAccount = require('../firebase-service-account.json');

const app = express();

// Connect to database
connectDB();

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://lawconnect-swe2547.firebaseio.com'
  });
}

const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use(limiter);
app.use(cors());
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "script-src 'self' https://www.gstatic.com https://*.firebaseio.com; object-src 'none';");
  next();
});
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '..')));

// Routes
const usersRouter = require('./users');
const casesRouter = require('./cases');
const appointmentsRouter = require('./appointments');
const messagesRouter = require('./messages');
const notificationsRouter = require('./notifications');
const paymentsRouter = require('./payments');
const documentsRouter = require('./documents');

app.use('/api/users', usersRouter);
app.use('/api/cases', casesRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/documents', documentsRouter);

// Page routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.get('/settings', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'settings.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'SignupPage.html'));
});

app.get('/account-type', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'accTypeInterface.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'loginPage.html'));
});

app.get('/client-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'ClientDashboard.html'));
});

app.get('/lawyer-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'LawyerDashboard.html'));
});

app.get('/book-appointment', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'BookAppointment.html'));
});

app.get('/case-management', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'CaseManagementDashboard.html'));
});

app.get('/admin-login', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'admin-login.html'));
});

app.get('/admin-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'AdminDashboard.html'));
});

app.get('/messages', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'Message.html'));
});

app.get('/notifications', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'notifications.html'));
});

// Error handling
app.use((req, res, next) => {
    console.warn(`404 Not Found: ${req.method} ${req.originalUrl}`);
    res.status(404).sendFile(path.join(__dirname, '..', '404.html'));
});

app.use((err, req, res, next) => {
    console.error('Server Error:', err.stack);
    res.status(500).sendFile(path.join(__dirname, '..', '500.html'));
});

// Export for Vercel
module.exports = app;
