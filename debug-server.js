const express = require('express');
const app = express();
const PORT = 3000;

console.log('Testing basic server setup...');

app.use(express.json());
console.log('JSON middleware loaded');

app.get('/test', (req, res) => {
  res.json({ message: 'Test route working' });
});
console.log('Test route loaded');

console.log('Testing route imports...');

try {
  const usersRoute = require('./api/users');
  app.use('/api/users', usersRoute);
  console.log('Users route loaded successfully');
} catch (error) {
  console.error('Error loading users route:', error.message);
}

try {
  const casesRoute = require('./api/cases');
  app.use('/api/cases', casesRoute);
  console.log('Cases route loaded successfully');
} catch (error) {
  console.error('Error loading cases route:', error.message);
}

try {
  const appointmentsRoute = require('./api/appointments');
  app.use('/api/appointments', appointmentsRoute);
  console.log('Appointments route loaded successfully');
} catch (error) {
  console.error('Error loading appointments route:', error.message);
}

try {
  const messagesRoute = require('./api/messages');
  app.use('/api/messages', messagesRoute);
  console.log('Messages route loaded successfully');
} catch (error) {
  console.error('Error loading messages route:', error.message);
}

try {
  const notificationsRoute = require('./api/notifications');
  app.use('/api/notifications', notificationsRoute);
  console.log('Notifications route loaded successfully');
} catch (error) {
  console.error('Error loading notifications route:', error.message);
}

app.listen(PORT, () => {
  console.log(`Debug server running on http://localhost:${PORT}`);
});

