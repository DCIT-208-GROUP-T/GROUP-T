const admin = require('firebase-admin');
const db = admin.firestore();
const clientProfilesCollection = db.collection('clientProfiles');

async function getAllClientProfiles() {
  const snapshot = await clientProfilesCollection.get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function getClientProfileById(id) {
  const doc = await clientProfilesCollection.doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

async function getClientProfileByUserId(userId) {
  const snapshot = await clientProfilesCollection.where('userId', '==', userId).limit(1).get();
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
}

async function createClientProfile(data) {
  const docData = {
    ...data,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };
  const docRef = await clientProfilesCollection.add(docData);
  const doc = await docRef.get();
  return { id: doc.id, ...doc.data() };
}

async function updateClientProfile(id, data) {
  const docRef = clientProfilesCollection.doc(id);
  await docRef.update({
    ...data,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  const updatedDoc = await docRef.get();
  return { id: updatedDoc.id, ...updatedDoc.data() };
}

async function deleteClientProfile(id) {
  const docRef = clientProfilesCollection.doc(id);
  const doc = await docRef.get();
  if (!doc.exists) return null;
  await docRef.delete();
  return { id: doc.id, ...doc.data() };
}

module.exports = {
  getAllClientProfiles,
  getClientProfileById,
  getClientProfileByUserId,
  createClientProfile,
  updateClientProfile,
  deleteClientProfile
};
