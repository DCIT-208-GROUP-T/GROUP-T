require('dotenv').config();

console.log('Environment variables loaded:');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
console.log('FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? 'SET' : 'NOT SET');
console.log('FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL ? 'SET' : 'NOT SET');
console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID || 'NOT SET');

console.log('\nFull MONGODB_URI:', process.env.MONGODB_URI);
