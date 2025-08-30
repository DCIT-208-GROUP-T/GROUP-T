const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet'); // For basic security headers
const morgan = require('morgan'); // For request logging
const connectDB = require('./config/database');
const config = require('./config');

const app = express();
const PORT = config.PORT;

connectDB();

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

app.use(morgan('dev')); // 'dev' format provides concise output colored by status

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname)));

app.get('/settings', (req, res) => {
    console.log('Serving settings.html');
    res.sendFile(path.join(__dirname, 'settings.html'));
});

app.use('/api/users', require('./api/users'));
app.use('/api/cases', require('./api/cases'));
app.use('/api/appointments', require('./api/appointments'));
app.use('/api/messages', require('./api/messages'));
app.use('/api/notifications', require('./api/notifications'));
app.use('/api/payments', require('./api/payments'));

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

app.get('/messages', (req, res) => {
    console.log('Serving Message.html');
    res.sendFile(path.join(__dirname, 'Message.html'));
});

app.get('/notifications', (req, res) => {
    console.log('Serving notifications.html');
    res.sendFile(path.join(__dirname, 'notifications.html'));
});

app.use((req, res, next) => {
    console.warn(`404 Not Found: ${req.method} ${req.originalUrl}`);
    res.status(404).sendFile(path.join(__dirname, '404.html')); // Serve a custom 404 page
});

app.use((err, req, res, next) => {
    console.error('Server Error:', err.stack);
    res.status(500).sendFile(path.join(__dirname, '500.html')); // Serve a custom 500 page
});

app.listen(PORT, () => {
    console.log(`LawConnect server running on http://localhost:${PORT}`);
    console.log(`Access your app at: http://localhost:${PORT}`);
});

