const admin = require('firebase-admin');

const serviceAccount = require('./firebase-service-account.json'); // Update this path

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'lawconnect-swe2547'
});

const db = admin.firestore();
const auth = admin.auth();

async function createAdminUser() {
  try {
    console.log('🔧 Setting up Firebase Admin user...\n');

    // Admin credentials - CHANGE THESE!
    const adminEmail = 'admin@lawconnect.com';
    const adminPassword = 'AdminSecure123!';
    const adminFullName = 'System Administrator';

    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
    console.log('👤 Name:', adminFullName);
    console.log('\n⏳ Creating user...\n');

    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email: adminEmail,
      emailVerified: true,
      password: adminPassword,
      displayName: adminFullName,
    });

    console.log('✅ User created in Firebase Auth');
    console.log('🆔 UID:', userRecord.uid);

    // Create user document in Firestore with admin role
    const userData = {
      firebaseUid: userRecord.uid,
      email: adminEmail,
      fullName: adminFullName,
      accountType: 'admin',
      phoneNumber: '',
      profilePicture: '',
      isActive: true,
      lastLogin: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('users').doc(userRecord.uid).set(userData);

    console.log('✅ Admin user profile created in Firestore');
    console.log('\n🎉 ADMIN USER CREATED SUCCESSFULLY!');
    console.log('=' .repeat(50));
    console.log('📋 SAVE THESE CREDENTIALS:');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    console.log('Access URL: http://localhost:3000/admin-login');
    console.log('=' .repeat(50));
    console.log('\n⚠️  IMPORTANT: Change the password after first login!');
    console.log('🔒 Keep these credentials secure!');

  } catch (error) {
    console.error('\n❌ Error creating admin user:', error.message);

    if (error.code === 'auth/email-already-exists') {
      console.log('\n💡 The email already exists. Try a different email or delete the existing user first.');
    } else if (error.code === 'auth/weak-password') {
      console.log('\n💡 Password is too weak. Use at least 6 characters.');
    } else {
      console.log('\n🔍 Make sure:');
      console.log('   - You have the correct service account key file');
      console.log('   - The file path is correct in this script');
      console.log('   - Firebase project ID is correct');
    }
  }
}

// Run the function
createAdminUser().then(() => {
  console.log('\n🏁 Script completed.');
  process.exit(0);
}).catch((error) => {
  console.error('\n💥 Script failed:', error);
  process.exit(1);
});
