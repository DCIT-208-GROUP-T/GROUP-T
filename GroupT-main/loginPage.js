// Firebase configuration (ensure this matches your project)
const firebaseConfig = {
  apiKey: "AIzaSyAlyIP81ut-Stj6Uyf123SOTNThfnNxYOs",
  authDomain: "lawconnect-swe2547.firebaseapp.com",
  projectId: "lawconnect-swe2547",
  storageBucket: "lawconnect-swe2547.firebasestorage.app",
  messagingSenderId: "584082304319",
  appId: "1:584082304319:web:106b26321b34f64ac9b78a",
  measurementId: "G-XYJC8JJ5NE" // Optional, if you use Analytics
};

// Initialize Firebase (only if not already initialized)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();

// DOM Elements
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const rememberCheckbox = document.getElementById('remember');
const loginBtn = document.querySelector('.login-btn');

// Get account type from URL (if navigating from accTypeInterface.html)
const urlParams = new URLSearchParams(window.location.search);
const selectedAccountType = urlParams.get('type');

/**
 * Handles the login form submission.
 * @param {Event} e The submit event.
 */
loginForm.addEventListener('submit', async function(e) {
  e.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const rememberMe = rememberCheckbox.checked;

  // Basic client-side validation
  if (!email || !password) {
    alert('Please enter both your email and password.');
    return;
  }
 
  // Set loading state for the button
  loginBtn.textContent = 'LOGGING IN...';
  loginBtn.disabled = true;
  loginBtn.classList.add('loading'); // Add a class for potential loading spinner/styles

  try {
    // Authenticate with Firebase
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const user = userCredential.user;
    const urlParams = new URLSearchParams(window.location.search);
    const selectedAccountType = urlParams.get('type');
    

    // Fetch user data from Firestore
    const userDoc = await db.collection('users').doc(user.uid).get(); 
    console.log('Fetching user data for UID:', user.uid); // Debugging line

    if (userDoc.exists) {
      const userData = userDoc.data();

      // Check if the logged-in user's account type matches the selected type (if any)
      if (selectedAccountType && userData.accountType !== selectedAccountType) {
        alert(`You are trying to log in as a ${selectedAccountType}, but your account is registered as a ${userData.accountType}. Please choose the correct login type.`);
        auth.signOut(); // Log out the user if account type mismatch
        return;
      }

      // Prepare session data
      const sessionData = {
        uid: user.uid,
        email: user.email,
        fullName: userData.fullName,
        accountType: userData.accountType,
        phone: userData.phone,
        // Add other relevant user data
      };

      if (userData.accountType === 'lawyer') {
        sessionData.firmName = userData.firmName;
        sessionData.barNumber = userData.barNumber;
        sessionData.specialization = userData.specialization;
      }
      // No specific client-only fields needed for session for now, but can be added

      // Store user session data in localStorage or sessionStorage
      console.log('Storing user session:', sessionData); // Debugging line
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('lawconnect_user', JSON.stringify(sessionData));
      console.log('Local Storage after login:', localStorage); // Check local storage contents
      console.log('Storing user session:', sessionData); // Debugging line
      storage.setItem('lawconnect_user', JSON.stringify(sessionData));

      // Store remembered email and password if checkbox is checked
      if (rememberMe) {
        localStorage.setItem('lawconnect_remembered_email', email);
      } else {
        localStorage.removeItem('lawconnect_remembered_email');
      }

      alert(`Welcome back, ${userData.fullName}!`);

      // Redirect based on account type
      if (userData.accountType === 'lawyer') {
        window.location.href = 'LawyerDashboard.html'; // Redirect to enhanced lawyer dashboard
      } else {
        window.location.href = 'ClientDashboard.html'; // Redirect to client dashboard
      }

    } else {
      // This case should ideally not happen if user was created via signup
      throw new Error('User profile data not found. Please contact support.');
    }

  } catch (error) {
    console.error('Login error:', error);
    let errorMessage = 'Login failed. Please try again.';

    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = 'No account found with this email. Please sign up first.';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Incorrect password. Please check your password and try again.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Please enter a valid email address.';
        break;
      case 'auth/user-disabled':
        errorMessage = 'This account has been disabled. Please contact support.';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Too many failed login attempts. Please try again later.';
        break;
      default:
        errorMessage = `An unexpected error occurred: ${error.message}`;
    }
    alert(errorMessage);

  } finally {
    // Reset button state
    loginBtn.textContent = 'LOGIN';
    loginBtn.disabled = false;
    loginBtn.classList.remove('loading');
  }
});

/**
 * Auto-fills the email field if "Remember password" was checked previously.
 */
document.addEventListener('DOMContentLoaded', function() {
  const rememberedEmail = localStorage.getItem('lawconnect_remembered_email');
  if (rememberedEmail) {
    emailInput.value = rememberedEmail;
    rememberCheckbox.checked = true;
  }
});

/**
 * Allows submitting the form by pressing Enter key in input fields.
 */
document.addEventListener('keypress', function(e) {
  if (e.key === 'Enter' && !loginBtn.disabled) {
    loginForm.dispatchEvent(new Event('submit'));
  }
});
