const admin = require('firebase-admin');
const { getUserById, createUser } = require('../models/UserFirestore');

module.exports = async function firebaseAuth(req, res, next) {
  try {
    // Accept Authorization: Bearer <idToken> or ?token=<idToken>
    const authHeader = req.headers.authorization || '';
    const tokenFromHeader = (authHeader.match(/^Bearer (.+)$/) || [])[1];
    const idToken = tokenFromHeader || req.query.token || req.body?.token;

    if (!idToken) {
      return res.status(401).json({ success:false, message: 'Missing auth token' });
    }

    const decoded = await admin.auth().verifyIdToken(idToken).catch(() => null);
    if (!decoded) {
      return res.status(401).json({ success:false, message: 'Invalid Firebase ID token' });
    }

    // Allow user creation without existing DB user
    if (req.method === 'POST' && req.path === '/users') {
      req.user = {
        firebaseUid: decoded.uid,
        email: decoded.email,
        name: decoded.name
      };
      return next();
    }

    // Find the corresponding Firestore user by firebaseUid
    let dbUser = await getUserById(decoded.uid);
    if (!dbUser) {
      // Try to create user from Firebase auth data
      const newUserData = {
        firebaseUid: decoded.uid,
        email: decoded.email,
        fullName: decoded.name || decoded.email.split('@')[0],
        accountType: 'client', // default
        phoneNumber: '',
        profilePicture: '',
        isActive: true,
        lastLogin: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      dbUser = await createUser(newUserData);
    }

    // Attach normalized user info for route handlers
    req.user = {
      id: dbUser.id,
      accountType: dbUser.accountType,
      firebaseUid: decoded.uid
    };

    next();
  } catch (err) {
    console.error('firebaseAuth middleware error:', err);
    res.status(500).json({ success:false, message: 'Auth middleware error' });
  }
};
