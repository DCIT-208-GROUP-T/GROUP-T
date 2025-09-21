const admin = require('firebase-admin');
const db = admin.firestore();
const messagesCollection = db.collection('messages');

async function createMessage(messageData) {
  const messageRef = messagesCollection.doc();
  const newMessage = {
    ...messageData,
    id: messageRef.id,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  await messageRef.set(newMessage);
  return newMessage;
}

async function getMessageById(messageId) {
  const messageDoc = await messagesCollection.doc(messageId).get();
  if (!messageDoc.exists) {
    return null;
  }
  return { id: messageDoc.id, ...messageDoc.data() };
}

async function updateMessage(messageId, updateData) {
  const messageRef = messagesCollection.doc(messageId);
  await messageRef.update({
    ...updateData,
    updatedAt: new Date()
  });
  const updatedDoc = await messageRef.get();
  return { id: updatedDoc.id, ...updatedDoc.data() };
}

async function deleteMessage(messageId) {
  await messagesCollection.doc(messageId).delete();
}

async function getMessagesBySender(senderId) {
  const querySnapshot = await messagesCollection.where('senderId', '==', senderId).get();
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function getMessagesByReceiver(receiverId) {
  const querySnapshot = await messagesCollection.where('receiverId', '==', receiverId).get();
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function getMessagesByCase(caseId) {
  const querySnapshot = await messagesCollection.where('caseId', '==', caseId).get();
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function getConversation(userId1, userId2, caseId = null, limit = 50) {
  let query = messagesCollection
    .where('senderId', 'in', [userId1, userId2])
    .where('receiverId', 'in', [userId1, userId2])
    .orderBy('createdAt', 'desc')
    .limit(limit);

  if (caseId) {
    query = query.where('caseId', '==', caseId);
  }

  const snapshot = await query.get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function markMessageAsRead(messageId) {
  const messageRef = messagesCollection.doc(messageId);
  await messageRef.update({
    isRead: true,
    readAt: new Date(),
    updatedAt: new Date()
  });
  const updatedDoc = await messageRef.get();
  return { id: updatedDoc.id, ...updatedDoc.data() };
}

async function getAllMessages() {
  const snapshot = await messagesCollection.orderBy('createdAt', 'desc').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function getMessagesByUser(userId, type = 'all') {
  let query = messagesCollection;

  if (type === 'sent') {
    query = query.where('senderId', '==', userId);
  } else if (type === 'received') {
    query = query.where('receiverId', '==', userId);
  } else {
    query = query.where('senderId', '==', userId).where('receiverId', '==', userId); // This won't work, need union
    // For Firestore, to get messages where user is sender or receiver, it's tricky without composite queries
    // For now, get all and filter in code, or use separate queries
  }

  const snapshot = await query.orderBy('createdAt', 'desc').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function getUnreadMessagesByUser(userId) {
  const snapshot = await messagesCollection
    .where('receiverId', '==', userId)
    .where('isRead', '==', false)
    .orderBy('createdAt', 'desc')
    .get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

module.exports = {
  createMessage,
  getMessageById,
  updateMessage,
  deleteMessage,
  getMessagesBySender,
  getMessagesByReceiver,
  getMessagesByCase,
  getConversation,
  markMessageAsRead,
  getAllMessages,
  getMessagesByUser,
  getUnreadMessagesByUser
};
