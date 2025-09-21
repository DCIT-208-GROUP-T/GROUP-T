const admin = require('firebase-admin');
const db = admin.firestore();
const usersCollection = db.collection('users');

async function getAllUsers() {
  const snapshot = await usersCollection.get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function getUserById(id) {
  const doc = await usersCollection.doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

async function getUserByEmail(email) {
  const snapshot = await usersCollection.where('email', '==', email).limit(1).get();
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
}

async function createUser(data) {
  const docRef = await usersCollection.add(data);
  const doc = await docRef.get();
  return { id: doc.id, ...doc.data() };
}

async function updateUser(id, data) {
  const docRef = usersCollection.doc(id);
  await docRef.update(data);
  const updatedDoc = await docRef.get();
  return { id: updatedDoc.id, ...updatedDoc.data() };
}

async function deleteUser(id) {
  const docRef = usersCollection.doc(id);
  const doc = await docRef.get();
  if (!doc.exists) return null;
  await docRef.delete();
  return { id: doc.id, ...doc.data() };
}

module.exports = {
  getAllUsers,
  getUserById,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser
};
