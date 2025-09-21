const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet'); // For basic security headers
const morgan = require('morgan'); // For request logging
const config = require('./config');
const admin = require('firebase-admin');

const app = express();
const PORT = config.PORT;

// Initialize Firebase Admin
if (!admin.apps.length) {
  const firebaseConfig = {
    credential: admin.credential.cert({
      type: "service_account",
      project_id: config.FIREBASE_PROJECT_ID,
      private_key: config.FIREBASE_PRIVATE_KEY,
      client_email: config.FIREBASE_CLIENT_EMAIL,
    }),
    databaseURL: `https://${config.FIREBASE_PROJECT_ID}.firebaseio.com`
  };

  admin.initializeApp(firebaseConfig);
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

app.use(morgan(config.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname)));

app.get('/settings', (req, res) => {
    console.log('Serving settings.html');
    res.sendFile(path.join(__dirname, 'settings.html'));
});

app.get('/lawyer-settings', (req, res) => {
    console.log('Serving lawyer-settings.html');
    res.sendFile(path.join(__dirname, 'lawyer-settings.html'));
});

const firebaseAuth = require('./middleware/firebaseAuth');

const usersRouter = require('./api/users');
const casesRouter = require('./api/cases');
const appointmentsRouter = require('./api/appointments');
const messagesRouter = require('./api/messages');
const notificationsRouter = require('./api/notifications');
const paymentsRouter = require('./api/payments');
const documentsRouter = require('./api/documents');

app.use('/api', firebaseAuth);

app.use('/api/users', usersRouter);
app.use('/api/cases', casesRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/documents', documentsRouter);

app.get('/', (req, res) => {
    console.log('Serving index.html');
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/signup', (req, res) => {
    console.log('Serving SignupPage.html');
    res.sendFile(path.join(__dirname, 'SignupPage.html'));
});

app.get('/account-type', (req, res) => {
    console.log('Serving accTypeInterface.html');
    res.sendFile(path.join(__dirname, 'accTypeInterface.html'));
});

app.get('/login', (req, res) => {
    console.log('Serving loginPage.html');
    res.sendFile(path.join(__dirname, 'loginPage.html'));
});

app.get('/client-dashboard', (req, res) => {
    console.log('Serving ClientDashboard.html');
    res.sendFile(path.join(__dirname, 'ClientDashboard.html'));
});

app.get('/lawyer-dashboard', (req, res) => {
    console.log('Serving LawyerDashboard.html');
    res.sendFile(path.join(__dirname, 'LawyerDashboard.html'));
});

app.get('/book-appointment', (req, res) => {
    console.log('Serving BookAppointment.html');
    res.sendFile(path.join(__dirname, 'BookAppointment.html'));
});

app.get('/case-management', (req, res) => {
    console.log('Serving CaseManagementDashboard.html');
    res.sendFile(path.join(__dirname, 'CaseManagementDashboard.html'));
});

app.get('/admin-login', (req, res) => {
    console.log('Serving admin-login.html');
    res.sendFile(path.join(__dirname, 'admin-login.html'));
});

app.get('/admin-login-page', (req, res) => {
    console.log('Serving admin-login-page.html');
    res.sendFile(path.join(__dirname, 'admin-login-page.html'));
});

app.get('/admin-dashboard', (req, res) => {
    console.log('Serving AdminDashboard.html');
    res.sendFile(path.join(__dirname, 'AdminDashboard.html'));
});

app.get('/messages', (req, res) => {
    console.log('Serving client-messages.html');
    res.sendFile(path.join(__dirname, 'client-messages.html'));
});

app.get('/lawyer-messages', (req, res) => {
    console.log('Serving lawyer-messages.html');
    res.sendFile(path.join(__dirname, 'lawyer-messages.html'));
});

app.get('/notifications', (req, res) => {
    console.log('Serving notifications.html');
    res.sendFile(path.join(__dirname, 'notifications.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config.NODE_ENV
    });
});

app.use((req, res, next) => {
    console.warn(`404 Not Found: ${req.method} ${req.originalUrl}`);
    res.status(404).sendFile(path.join(__dirname, '404.html')); // Serve a custom 404 page
});

app.use((err, req, res, next) => {
    console.error('Server Error:', err.stack);
    res.status(500).sendFile(path.join(__dirname, '500.html')); // Serve a custom 500 page
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`LawConnect server running on http://localhost:${PORT}`);
    console.log(`Access your app at: http://localhost:${PORT}`);
  });
}

module.exports = app;

