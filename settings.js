import firebaseConfig from './firebase-config.js';

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();

let currentUser = null;

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

async function loadUserData() {
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

    const userData = userDoc.data();
    currentUser = userData;

    document.getElementById('accountType').value = userData.accountType ? userData.accountType.charAt(0).toUpperCase() + userData.accountType.slice(1) : '';
    document.getElementById('email').value = userData.email || '';
    document.getElementById('userId').value = user.uid;
    document.getElementById('fullName').value = userData.fullName || '';
    document.getElementById('phoneNumber').value = userData.phone || '';
    document.getElementById('profilePicture').value = userData.profilePicture || '';

    // Format dates if available
    document.getElementById('lastLogin').value = user.metadata.lastSignInTime || 'Unknown';
    document.getElementById('createdAt').value = user.metadata.creationTime || 'Unknown';

  } catch (error) {
    console.error('Error loading user data:', error);
    showToast('Failed to load user data', 'error');
  }
}

async function saveProfile() {
  const saveBtn = document.getElementById('saveProfileBtn');
  const originalText = saveBtn.innerHTML;

  try {
    saveBtn.innerHTML = '<span class="loading"></span> Saving...';
    saveBtn.disabled = true;

    const updatedData = {
      fullName: document.getElementById('fullName').value,
      phone: document.getElementById('phoneNumber').value,
      profilePicture: document.getElementById('profilePicture').value
    };

    const user = auth.currentUser;
    if (!user) {
      showToast('User not authenticated', 'error');
      return;
    }

    await db.collection('users').doc(user.uid).update(updatedData);

    showToast('Profile updated successfully!');

  } catch (error) {
    console.error('Error updating profile:', error);
    showToast('Failed to update profile', 'error');
  } finally {
    saveBtn.innerHTML = originalText;
    saveBtn.disabled = false;
  }
}

function savePreferences() {
  const emailNotifications = document.getElementById('emailNotifications').checked;
  const pushNotifications = document.getElementById('pushNotifications').checked;
  const darkMode = document.getElementById('darkMode').checked;

  localStorage.setItem('emailNotifications', emailNotifications);
  localStorage.setItem('pushNotifications', pushNotifications);
  localStorage.setItem('darkMode', darkMode);

  if (darkMode) {
    document.documentElement.style.setProperty('--bg-light', '#1e293b');
    document.documentElement.style.setProperty('--card-bg', '#334155');
    document.documentElement.style.setProperty('--text-dark', '#f1f5f9');
    document.documentElement.style.setProperty('--text-light', '#cbd5e1');
    document.documentElement.style.setProperty('--border-color', '#475569');
  } else {
    document.documentElement.style.setProperty('--bg-light', '#f8fafc');
    document.documentElement.style.setProperty('--card-bg', '#ffffff');
    document.documentElement.style.setProperty('--text-dark', '#1e293b');
    document.documentElement.style.setProperty('--text-light', '#64748b');
    document.documentElement.style.setProperty('--border-color', '#e2e8f0');
  }

  showToast('Preferences saved successfully!');
}

function changePassword() {
  showToast('Password change functionality coming soon!', 'error');
}

function logout() {
  showToast('Logging out...');
  setTimeout(() => {
    window.location.href = 'loginPage.html';
  }, 1500);
}

document.addEventListener('DOMContentLoaded', () => {
  auth.onAuthStateChanged(user => {
    if (user) {
      loadUserData();

      // Load saved preferences
      const darkMode = localStorage.getItem('darkMode') === 'true';
      document.getElementById('darkMode').checked = darkMode;
      document.getElementById('emailNotifications').checked = localStorage.getItem('emailNotifications') !== 'false';
      document.getElementById('pushNotifications').checked = localStorage.getItem('pushNotifications') !== 'false';

      if (darkMode) {
        savePreferences();
      }
    } else {
      window.location.href = 'loginPage.html';
    }
  });
});
