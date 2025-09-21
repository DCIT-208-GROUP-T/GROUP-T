const admin = require('firebase-admin');
const db = admin.firestore();
const documentsCollection = db.collection('documents');

async function getAllDocuments() {
  const snapshot = await documentsCollection.get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function getDocumentById(id) {
  const doc = await documentsCollection.doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

async function getDocumentsByUserId(userId) {
  const snapshot = await documentsCollection.where('userId', '==', userId).get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function getDocumentsByCaseId(caseId) {
  const snapshot = await documentsCollection.where('caseId', '==', caseId).get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function getDocumentsByCategory(category) {
  const snapshot = await documentsCollection.where('category', '==', category).get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function createDocument(data) {
  const docData = {
    ...data,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };
  const docRef = await documentsCollection.add(docData);
  const doc = await docRef.get();
  return { id: doc.id, ...doc.data() };
}

async function updateDocument(id, data) {
  const docRef = documentsCollection.doc(id);
  await docRef.update({
    ...data,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  const updatedDoc = await docRef.get();
  return { id: updatedDoc.id, ...updatedDoc.data() };
}

async function deleteDocument(id) {
  const docRef = documentsCollection.doc(id);
  const doc = await docRef.get();
  if (!doc.exists) return null;
  await docRef.delete();
  return { id: doc.id, ...doc.data() };
}

async function getFileSizeFormatted(size) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (size === 0) return '0 Bytes';
  const i = parseInt(Math.floor(Math.log(size) / Math.log(1024)));
  return Math.round(size / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

async function getFileIcon(mimetype) {
  const type = mimetype.split('/')[0];
  switch (type) {
    case 'image': return '🖼️';
    case 'video': return '🎥';
    case 'audio': return '🎵';
    case 'text': return '📝';
    default: return '📄';
  }
}

module.exports = {
  getAllDocuments,
  getDocumentById,
  getDocumentsByUserId,
  getDocumentsByCaseId,
  getDocumentsByCategory,
  createDocument,
  updateDocument,
  deleteDocument,
  getFileSizeFormatted,
  getFileIcon
};
