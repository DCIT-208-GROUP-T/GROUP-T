// Simple script to create admin user using Firebase Web SDK
// Run this in browser console or as a standalone script

const firebaseConfig = {
  apiKey: "AIzaSyAlyIP81ut-Stj6Uyf123SOTNThfnNxYOs",
  authDomain: "lawconnect-swe2547.firebaseapp.com",
  projectId: "lawconnect-swe2547",
  storageBucket: "lawconnect-swe2547.firebasestorage.app",
  messagingSenderId: "584082304319",
  appId: "1:584082304319:web:106b26321b34f64ac9b78a",
  measurementId: "G-XYJC8JJ5NE"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

async function createAdminUser() {
  const adminEmail = prompt('Enter admin email:');
  const adminPassword = prompt('Enter admin password:');
  const adminFullName = prompt('Enter admin full name:');

  if (!adminEmail || !adminPassword || !adminFullName) {
    alert('All fields are required!');
    return;
  }

  try {
    console.log('Creating admin user...');

    // Create user in Firebase Auth
    const userCredential = await auth.createUserWithEmailAndPassword(adminEmail, adminPassword);
    const user = userCredential.user;

    console.log('User created in Firebase Auth:', user.uid);

    // Create user document in Firestore with admin role
    const userData = {
      firebaseUid: user.uid,
      email: adminEmail,
      fullName: adminFullName,
      accountType: 'admin',
      phoneNumber: '',
      profilePicture: '',
      isActive: true,
      lastLogin: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection('users').doc(user.uid).set(userData);

    alert(`Admin user created successfully!\n\nEmail: ${adminEmail}\nPassword: ${adminPassword}\nName: ${adminFullName}`);

    console.log('Admin user created successfully!');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    console.log('Full Name:', adminFullName);
    console.log('UID:', user.uid);

  } catch (error) {
    console.error('Error creating admin user:', error);
    alert('Error creating admin user: ' + error.message);
  }
}

// Auto-run the function
createAdminUser();
