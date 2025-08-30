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
const signupForm = document.getElementById('signupForm');
const lawyerRadio = document.querySelector('input[value="lawyer"]');
const clientRadio = document.querySelector('input[value="client"]');
const lawyerFields = document.getElementById('lawyerFields');
const clientFields = document.getElementById('clientFields');
const barNumberInput = document.getElementById('barNumber');
const specializationSelect = document.getElementById('specialization');
const clientCaseTypeSelect = document.getElementById('clientCaseType');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const termsCheckbox = document.getElementById('terms');
const signupBtn = document.querySelector('.signup-btn');
const passwordError = document.getElementById('password-error');
const confirmPasswordError = document.getElementById('confirm-password-error');
const profilePictureInput = document.getElementById('profilePicture'); // New profile picture input

/**
 * Toggles the visibility and required status of lawyer/client specific fields.
 */
function toggleAccountTypeFields() {
  console.log("Toggling account type fields"); // Debug log
  console.log("Lawyer radio checked:", lawyerRadio.checked);
  console.log("Client radio checked:", clientRadio.checked);
  
  if (lawyerRadio.checked) {
    console.log("Showing lawyer fields, hiding client fields");
    lawyerFields.style.display = 'block';
    clientFields.style.display = 'none';
    barNumberInput.required = true;
    specializationSelect.required = true;
    clientCaseTypeSelect.required = false;
  } else if (clientRadio.checked) {
    console.log("Showing client fields, hiding lawyer fields");
    clientFields.style.display = 'block';
    lawyerFields.style.display = 'none';
    clientCaseTypeSelect.required = false;
    barNumberInput.required = false;
    specializationSelect.required = false;
  } else {
    console.log("No account type selected, hiding all fields");
    lawyerFields.style.display = 'none';
    clientFields.style.display = 'none';
    barNumberInput.required = false;
    specializationSelect.required = false;
    clientCaseTypeSelect.required = false;
  }
  
  console.log("Lawyer fields display:", lawyerFields.style.display);
  console.log("Client fields display:", clientFields.style.display);
}

/**
 * Validates the password strength.
 * @param {string} password The password to validate.
 * @returns {string|null} An error message if invalid, otherwise null.
 */
function validatePassword(password) {
  if (password.length < 6) {
    return 'Password must be at least 6 characters long.';
  }
  // Add more complex password rules here (e.g., require numbers, symbols, etc.)
  // if (!/[A-Z]/.test(password)) return 'Password must contain an uppercase letter.';
  // if (!/[0-9]/.test(password)) return 'Password must contain a number.';
  return null;
}

/**
 * Handles real-time password and confirm password validation feedback.
 */
function handlePasswordValidation() {
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  const passwordValidationMessage = validatePassword(password);
  if (passwordValidationMessage) {
    passwordInput.classList.add('invalid');
    passwordError.textContent = passwordValidationMessage;
  } else {
    passwordInput.classList.remove('invalid');
    passwordError.textContent = '';
  }

  if (confirmPassword && password !== confirmPassword) {
    confirmPasswordInput.classList.add('invalid');
    confirmPasswordError.textContent = 'Passwords do not match.';
  } else {
    confirmPasswordInput.classList.remove('invalid');
    confirmPasswordError.textContent = '';
  }
}

/**
 * Handles the signup form submission.
 * @param {Event} e The submit event.
 */
signupForm.addEventListener('submit', async function(e) {
  e.preventDefault();

  // Re-run validation before submission
  handlePasswordValidation();
  if (passwordInput.classList.contains('invalid') || confirmPasswordInput.classList.contains('invalid')) {
    alert('Please correct the password errors.');
    return;
  }

  if (!termsCheckbox.checked) {
    alert('You must agree to the Terms of Service and Privacy Policy.');
    return;
  }

  const email = document.getElementById('email').value.trim();
  const password = passwordInput.value;
  const profilePicture = profilePictureInput.files[0]; // Get profile picture input

  // Set loading state for the button
  signupBtn.textContent = 'CREATING ACCOUNT...';
  signupBtn.disabled = true;
  signupBtn.classList.add('loading'); // Add a class for potential loading spinner/styles

  try {
    // Create Firebase user account
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;

    // Gather form data for Firestore
    const formData = new FormData(this);
    const accountType = formData.get('accountType');

    const userData = {
      fullName: formData.get('fullName').trim(),
      email: email,
      phone: formData.get('phone').trim(),
      accountType: accountType,
      profilePicture: profilePicture ? profilePicture.name : '', // Include profile picture in user data
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    // Add account-specific data
    if (accountType === 'lawyer') {
      userData.firmName = formData.get('firmName').trim();
      userData.barNumber = formData.get('barNumber').trim();
      userData.specialization = formData.get('specialization');
    } else if (accountType === 'client') {
      userData.primaryLegalInterest = formData.get('clientCaseType') || 'Not specified';
    }

    // Save additional user data to Firestore
    await db.collection('users').doc(user.uid).set(userData);

    alert('Account created successfully! You can now log in.');
    // Optionally, send email verification: await user.sendEmailVerification();
    // Then redirect to login page
    window.location.href = 'loginPage.html';

  } catch (error) {
    console.error('Error during signup:', error);
    let errorMessage = 'Account creation failed. Please try again.';

    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'An account with this email already exists. Please log in instead.';
        break;
      case 'auth/weak-password':
        errorMessage = 'The password is too weak. Please use a stronger password.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'The email address is not valid.';
        break;
      default:
        errorMessage = `An unexpected error occurred: ${error.message}`;
    }
    alert(errorMessage);

  } finally {
    // Reset button state
    signupBtn.textContent = 'CREATE ACCOUNT';
    signupBtn.disabled = false;
    signupBtn.classList.remove('loading');
  }
});

lawyerRadio.addEventListener('change', function() {
  console.log("Lawyer radio button changed");
  toggleAccountTypeFields();
});
clientRadio.addEventListener('change', function() {
  console.log("Client radio button changed");
  toggleAccountTypeFields();
});

// Event Listeners for real-time password validation
passwordInput.addEventListener('input', handlePasswordValidation);
confirmPasswordInput.addEventListener('input', handlePasswordValidation);

// Initial call to set up fields based on default radio selection (if any)
document.addEventListener('DOMContentLoaded', () => {
  toggleAccountTypeFields();
});
