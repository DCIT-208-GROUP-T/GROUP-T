const admin = require('firebase-admin');
const db = admin.firestore();
const lawyerProfilesCollection = db.collection('lawyerProfiles');

async function getAllLawyerProfiles() {
  const snapshot = await lawyerProfilesCollection.get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function getLawyerProfileById(id) {
  const doc = await lawyerProfilesCollection.doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

async function getLawyerProfileByUserId(userId) {
  const snapshot = await lawyerProfilesCollection.where('userId', '==', userId).limit(1).get();
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
}

async function createLawyerProfile(data) {
  const docData = {
    ...data,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };
  const docRef = await lawyerProfilesCollection.add(docData);
  const doc = await docRef.get();
  return { id: doc.id, ...doc.data() };
}

async function updateLawyerProfile(id, data) {
  const docRef = lawyerProfilesCollection.doc(id);
  await docRef.update({
    ...data,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  const updatedDoc = await docRef.get();
  return { id: updatedDoc.id, ...updatedDoc.data() };
}

async function deleteLawyerProfile(id) {
  const docRef = lawyerProfilesCollection.doc(id);
  const doc = await docRef.get();
  if (!doc.exists) return null;
  await docRef.delete();
  return { id: doc.id, ...doc.data() };
}

module.exports = {
  getAllLawyerProfiles,
  getLawyerProfileById,
  getLawyerProfileByUserId,
  createLawyerProfile,
  updateLawyerProfile,
  deleteLawyerProfile
};
