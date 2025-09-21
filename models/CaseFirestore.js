const admin = require('firebase-admin');
const db = admin.firestore();
const casesCollection = db.collection('cases');

async function createCase(caseData) {
  const caseRef = casesCollection.doc();
  const newCase = {
    ...caseData,
    id: caseRef.id,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  await caseRef.set(newCase);
  return newCase;
}

async function getCaseById(caseId) {
  const caseDoc = await casesCollection.doc(caseId).get();
  if (!caseDoc.exists) {
    return null;
  }
  return { id: caseDoc.id, ...caseDoc.data() };
}

async function updateCase(caseId, updateData) {
  const caseRef = casesCollection.doc(caseId);
  await caseRef.update({
    ...updateData,
    updatedAt: new Date()
  });
  const updatedDoc = await caseRef.get();
  return { id: updatedDoc.id, ...updatedDoc.data() };
}

async function deleteCase(caseId) {
  await casesCollection.doc(caseId).delete();
}

async function getAllCases() {
  const snapshot = await casesCollection.get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function getCasesByClient(clientId) {
  const querySnapshot = await casesCollection.where('clientId', '==', clientId).get();
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function getCasesByLawyer(lawyerId) {
  const querySnapshot = await casesCollection.where('lawyerId', '==', lawyerId).get();
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function getCasesByStatus(status) {
  const querySnapshot = await casesCollection.where('status', '==', status).get();
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

module.exports = {
  createCase,
  getCaseById,
  updateCase,
  deleteCase,
  getAllCases,
  getCasesByClient,
  getCasesByLawyer,
  getCasesByStatus
};
