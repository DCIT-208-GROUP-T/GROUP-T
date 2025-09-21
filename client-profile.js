import firebaseConfig from './firebase-config.js';

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();

const profileAvatarEl = document.querySelector('.profile-avatar');
const profileNameEl = document.querySelector('.profile-info h2');
const profileSpecialtyEl = document.querySelector('.profile-specialty');
const contactEmailEl = document.querySelector('.profile-section p:nth-of-type(2)');
const contactPhoneEl = document.querySelector('.profile-section p:nth-of-type(3)');
const legalInterestEl = document.querySelector('.profile-section:nth-of-type(3) p');

async function loadUserProfile() {
  try {
    const user = auth.currentUser;
    if (!user) {
      window.location.href = 'loginPage.html';
      return;
    }

    const userDoc = await db.collection('users').doc(user.uid).get();
    if (!userDoc.exists) {
      console.warn('User document not found in Firestore');
      return;
    }

    const data = userDoc.data();

    // Set avatar initials
    if (data.fullName) {
      const initials = data.fullName.split(' ').map(n => n[0]).join('').toUpperCase();
      profileAvatarEl.textContent = initials;
    }

    profileNameEl.textContent = data.fullName || 'User';
    profileSpecialtyEl.textContent = data.accountType || '';

    contactEmailEl.textContent = `Email: ${data.email || ''}`;
    contactPhoneEl.textContent = `Phone: ${data.phone || ''}`;

    legalInterestEl.textContent = `Primary Legal Interest: ${data.primaryLegalInterest || data.caseType || 'Not specified'}`;

  } catch (error) {
    console.error('Error loading user profile:', error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  auth.onAuthStateChanged(user => {
    if (user) {
      loadUserProfile();
    } else {
      window.location.href = 'loginPage.html';
    }
  });
});
