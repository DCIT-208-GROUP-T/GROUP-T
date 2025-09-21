require('dotenv').config();

/*
// Temporarily commented out for testing
if (!process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL) {
  throw new Error('Firebase environment variables are required');
}
*/

const FIREBASE_PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : '';
const FIREBASE_CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL || '';

module.exports = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || 'lawconnect-swe2547',
  FIREBASE_PRIVATE_KEY,
  FIREBASE_CLIENT_EMAIL
};
