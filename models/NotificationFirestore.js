const admin = require('firebase-admin');
const db = admin.firestore();
const notificationsCollection = db.collection('notifications');

async function getUserNotifications(userId, options = {}) {
  const {
    limit = 50,
    skip = 0,
    unreadOnly = false,
    type = null
  } = options;

  let query = notificationsCollection.where('userId', '==', userId);

  if (unreadOnly) {
    query = query.where('isRead', '==', false);
  }

  if (type) {
    query = query.where('type', '==', type);
  }

  const snapshot = await query
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .offset(skip)
    .get();

  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function getUnreadCount(userId) {
  const snapshot = await notificationsCollection
    .where('userId', '==', userId)
    .where('isRead', '==', false)
    .get();

  return snapshot.size;
}

async function markAsRead(userId, notificationIds = null) {
  const batch = db.batch();

  if (notificationIds) {
    notificationIds.forEach(id => {
      const docRef = notificationsCollection.doc(id);
      batch.update(docRef, { isRead: true, readAt: admin.firestore.FieldValue.serverTimestamp() });
    });
  } else {
    // Mark all unread for user
    const snapshot = await notificationsCollection
      .where('userId', '==', userId)
      .where('isRead', '==', false)
      .get();

    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, { isRead: true, readAt: admin.firestore.FieldValue.serverTimestamp() });
    });
  }

  await batch.commit();
}

async function getNotificationById(id) {
  const doc = await notificationsCollection.doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

async function createNotification(data) {
  const docData = {
    ...data,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };
  const docRef = await notificationsCollection.add(docData);
  const doc = await docRef.get();
  return { id: doc.id, ...doc.data() };
}

async function updateNotification(id, data) {
  const docRef = notificationsCollection.doc(id);
  await docRef.update({
    ...data,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  const updatedDoc = await docRef.get();
  return { id: updatedDoc.id, ...updatedDoc.data() };
}

async function deleteNotification(id) {
  const docRef = notificationsCollection.doc(id);
  const doc = await docRef.get();
  if (!doc.exists) return null;
  await docRef.delete();
  return { id: doc.id, ...doc.data() };
}

async function deleteUserNotifications(userId) {
  const batch = db.batch();
  const snapshot = await notificationsCollection.where('userId', '==', userId).get();
  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });
  await batch.commit();
}

module.exports = {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  getNotificationById,
  createNotification,
  updateNotification,
  deleteNotification,
  deleteUserNotifications
};
