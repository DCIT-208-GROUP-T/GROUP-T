// Firebase configuration (ensure this matches your project)
const firebaseConfig = {
  apiKey: "AIzaSyAlyIP81ut-Stj6Uyf123SOTNThfnNxYOs",
  authDomain: "lawconnect-swe2547.firebaseapp.com",
  projectId: "lawconnect-swe2547",
  storageBucket: "lawconnect-swe2547.firebasestorage.app",
  messagingSenderId: "584082304319",
  appId: "1:584082304319:web:106b26321b34f64ac9b78a"
  // measurementId: "G-XYJC8JJ5NE" // Optional, if you use Analytics
};

// Initialize Firebase (only if not already initialized)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();

// API Base URL
const API_BASE_URL = 'http://localhost:3000/api';

// DOM Elements
const conversationList = document.getElementById('conversation-list');
const emptyChatState = document.getElementById('empty-chat-state');
const activeChatView = document.getElementById('active-chat-view');
const messagesContainer = document.getElementById('messages-container');
const messageInput = document.getElementById('message-text');
const sendBtn = document.getElementById('send-btn');
const chatTitle = document.getElementById('chat-title');
const caseBadge = document.getElementById('case-badge');
const conversationSearchInput = document.getElementById('conversation-search');

// State
let activeConversation = null;
let conversations = [];

/**
 * Loads and renders the list of conversations in the sidebar.
 */
async function loadConversations() {
  const userSession = JSON.parse(localStorage.getItem('lawconnect_user') || sessionStorage.getItem('lawconnect_user'));
  if (!userSession) {
    console.warn('No user session found. Redirecting to login.');
    window.location.href = 'loginPage.html';
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/messages/user/${userSession._id}`);
    if (response.ok) {
      conversations = await response.json();
      renderConversations(conversations);
    } else {
      console.error('Failed to load conversations:', response.statusText);
      conversationList.innerHTML = '<p class="no-conversations-message">Error loading conversations.</p>';
    }
  } catch (error) {
    console.error('Error loading conversations:', error);
    conversationList.innerHTML = '<p class="no-conversations-message">Error loading conversations.</p>';
  }
}

/**
 * Renders the list of conversations in the sidebar.
 */
function renderConversations(conversations) {
  conversationList.innerHTML = ''; // Clear existing conversations

  if (conversations.length === 0) {
    conversationList.innerHTML = '<p class="no-conversations-message">No conversations found.</p>';
    return;
  }

  conversations.forEach(conv => {
    const conversationElement = document.createElement('button');
    conversationElement.className = 'conversation-item';
    conversationElement.setAttribute('role', 'listitem');
    conversationElement.setAttribute('aria-label', `Conversation with ${conv.participantName}`);
    conversationElement.dataset.id = conv._id;

    conversationElement.innerHTML = `
      <div class="conversation-header">
        <div class="conversation-name">${conv.participantName}</div>
        <div class="conversation-time">${formatTimeForList(conv.createdAt)}</div>
      </div>
      <div class="conversation-preview">
        <div class="conversation-message">${conv.content}</div>
        ${!conv.isRead ? `<span class="unread-badge" aria-label="Unread message">1</span>` : ''}
      </div>
    `;

    conversationElement.addEventListener('click', () => openConversation(conv._id));
    conversationList.appendChild(conversationElement);
  });
}

/**
 * Opens a specific conversation in the chat area.
 * @param {string} conversationId The ID of the conversation to open.
 */
async function openConversation(conversationId) {
  const userSession = JSON.parse(localStorage.getItem('lawconnect_user') || sessionStorage.getItem('lawconnect_user'));
  if (!userSession) {
    console.warn('No user session found. Redirecting to login.');
    window.location.href = 'loginPage.html';
    return;
  }

  try {
    // Fetch conversation messages
    const response = await fetch(`${API_BASE_URL}/messages/${conversationId}`);
    if (response.ok) {
      activeConversation = await response.json();
      
      // Update UI: remove 'active' from all conversation items, add to the clicked one
      document.querySelectorAll('.conversation-item').forEach(el => {
        el.classList.remove('active');
      });
      const selectedConversationElement = conversationList.querySelector(`.conversation-item[data-id="${conversationId}"]`);
      if (selectedConversationElement) {
        selectedConversationElement.classList.add('active');
        // Remove unread badge from the selected conversation
        const unreadBadge = selectedConversationElement.querySelector('.unread-badge');
        if (unreadBadge) {
          unreadBadge.remove();
        }
      }

      // Update chat header details
      chatTitle.textContent = activeConversation.senderId.fullName || 'Unknown';
      caseBadge.textContent = activeConversation.caseId ? `Case #${activeConversation.caseId._id}` : '';

      renderMessages(); // Render messages for the active conversation

      emptyChatState.style.display = 'none'; // Hide empty state
      activeChatView.style.display = 'flex'; // Show active chat view

      // Scroll to the bottom of the messages container after rendering
      setTimeout(() => {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }, 50); // Small delay to ensure content is rendered
    } else {
      console.error('Failed to load conversation:', response.statusText);
    }
  } catch (error) {
    console.error('Error loading conversation:', error);
  }
}

/**
 * Renders the messages for the currently active conversation.
 */
function renderMessages() {
  messagesContainer.innerHTML = ''; // Clear existing messages

  if (!activeConversation) {
    messagesContainer.innerHTML = '<p class="empty-chat-state">No messages in this conversation.</p>';
    return;
  }

  // For now, we'll just show the current message
  const messageElement = document.createElement('div');
  messageElement.className = 'message message-incoming';
  messageElement.setAttribute('role', 'listitem');

  messageElement.innerHTML = `
    <div class="message-bubble incoming-bubble">
      ${activeConversation.content}
      <div class="message-time">${formatTime(activeConversation.createdAt)}</div>
    </div>
  `;
  messagesContainer.appendChild(messageElement);
}

/**
 * Sends a new message in the active conversation.
 */
async function sendMessage() {
  const text = messageInput.value.trim();
  if (!text || !activeConversation) {
    messageInput.value = ''; // Clear input even if empty
    return;
  }

  const userSession = JSON.parse(localStorage.getItem('lawconnect_user') || sessionStorage.getItem('lawconnect_user'));
  if (!userSession) {
    console.warn('No user session found. Redirecting to login.');
    window.location.href = 'loginPage.html';
    return;
  }

  // Create new message object
  const newMessage = {
    senderId: userSession._id,
    receiverId: activeConversation.senderId._id === userSession._id ? activeConversation.receiverId._id : activeConversation.senderId._id,
    caseId: activeConversation.caseId ? activeConversation.caseId._id : null,
    content: text,
    messageType: 'text'
  };

  try {
    const response = await fetch(`${API_BASE_URL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newMessage)
    });

    if (response.ok) {
      const savedMessage = await response.json();
      messageInput.value = ''; // Clear input field
      messageInput.style.height = 'auto'; // Reset textarea height
      
      // Reload conversations to show the new message
      loadConversations();
      
      // Scroll to the bottom of the messages container
      setTimeout(() => {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }, 50);
    } else {
      console.error('Failed to send message:', response.statusText);
    }
  } catch (error) {
    console.error('Error sending message:', error);
  }
}

/**
 * Auto-resizes the textarea based on content.
 */
function autoResizeTextarea() {
  messageInput.style.height = 'auto'; // Reset height to calculate new scrollHeight
  messageInput.style.height = messageInput.scrollHeight + 'px'; // Set height to scrollHeight
  if (messageInput.scrollHeight > 120) { // Max height limit
    messageInput.style.height = '120px';
    messageInput.style.overflowY = 'auto';
  } else {
    messageInput.style.overflowY = 'hidden';
  }
}

/**
 * Formats an ISO date string to a readable time (e.g., "10:30 AM").
 * @param {string} isoString The ISO date string.
 * @returns {string} Formatted time.
 */
function formatTime(isoString) {
  const options = { hour: 'numeric', minute: 'numeric', hour12: true };
  return new Date(isoString).toLocaleTimeString('en-US', options);
}

/**
 * Formats an ISO date string for the conversation list (e.g., "10:30 AM" or "Jul 18").
 * @param {string} isoString The ISO date string.
 * @returns {string} Formatted time or date.
 */
function formatTimeForList(isoString) {
  const date = new Date(isoString);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize today's date

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return formatTime(isoString); // Today, show time
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday'; // Yesterday
  } else {
    const options = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options); // Other days, show date
  }
}

// Event Listeners
sendBtn.addEventListener('click', sendMessage);

messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) { // Send on Enter, new line on Shift+Enter
    e.preventDefault();
    sendMessage();
  }
});

messageInput.addEventListener('input', autoResizeTextarea); // Auto-resize on input

conversationSearchInput.addEventListener('input', function() {
  const searchTerm = this.value.toLowerCase();
  const conversationItems = document.querySelectorAll('.conversation-item');

  conversationItems.forEach(item => {
    const name = item.querySelector('.conversation-name').textContent.toLowerCase();
    const message = item.querySelector('.conversation-message').textContent.toLowerCase();
    if (name.includes(searchTerm) || message.includes(searchTerm)) {
      item.style.display = 'block';
    } else {
      item.style.display = 'none';
    }
  });
});


// Initial load when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  loadConversations();
});
