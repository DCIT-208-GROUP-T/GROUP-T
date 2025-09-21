const firebaseConfig = {
  apiKey: "AIzaSyAlyIP81ut-Stj6Uyf123SOTNThfnNxYOs",
  authDomain: "lawconnect-swe2547.firebaseapp.com",
  projectId: "lawconnect-swe2547",
  storageBucket: "lawconnect-swe2547.firebasestorage.app",
  messagingSenderId: "584082304319",
  appId: "1:584082304319:web:106b26321b34f64ac9b78a",
  measurementId: "G-XYJC8JJ5NE"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();

const adminLoginForm = document.getElementById('adminLoginForm');
const adminEmailInput = document.getElementById('adminEmail');
const adminPasswordInput = document.getElementById('adminPassword');
const adminLoginBtn = document.querySelector('.login-btn');

adminLoginForm.addEventListener('submit', async function(e) {
  e.preventDefault();

  const email = adminEmailInput.value.trim();
  const password = adminPasswordInput.value;

  if (!email || !password) {
    alert('Please enter both email and password.');
    return;
  }

  adminLoginBtn.textContent = 'AUTHENTICATING...';
  adminLoginBtn.disabled = true;

  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const user = userCredential.user;

    const userDoc = await db.collection('users').doc(user.uid).get();

    if (userDoc.exists) {
      const userData = userDoc.data();

      if (userData.accountType !== 'admin') {
        alert('Access denied. Admin privileges required.');
        auth.signOut();
        return;
      }

      const sessionData = {
        uid: user.uid,
        email: user.email,
        fullName: userData.fullName,
        accountType: userData.accountType,
        phone: userData.phone
      };

      localStorage.setItem('lawconnect_user', JSON.stringify(sessionData));
      alert(`Welcome, Admin ${userData.fullName}!`);
      window.location.href = 'AdminDashboard.html';

    } else {
      throw new Error('Admin profile not found.');
    }

  } catch (error) {
    console.error('Admin login error:', error);
    let errorMessage = 'Admin login failed.';

    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = 'Admin account not found.';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Invalid admin credentials.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Invalid email format.';
        break;
      default:
        errorMessage = 'Admin authentication failed.';
    }
    alert(errorMessage);

  } finally {
    adminLoginBtn.textContent = 'ADMIN LOGIN';
    adminLoginBtn.disabled = false;
  }
});

document.addEventListener('keypress', function(e) {
  if (e.key === 'Enter' && !adminLoginBtn.disabled) {
    adminLoginForm.dispatchEvent(new Event('submit'));
  }
});
