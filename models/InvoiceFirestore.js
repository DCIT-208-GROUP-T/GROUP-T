const admin = require('firebase-admin');
const db = admin.firestore();
const invoicesCollection = db.collection('invoices');

async function getAllInvoices() {
  const snapshot = await invoicesCollection.get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function getInvoiceById(id) {
  const doc = await invoicesCollection.doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

async function getInvoicesByClient(client) {
  const snapshot = await invoicesCollection.where('client', '==', client).get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function createInvoice(data) {
  const docData = {
    ...data,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };
  const docRef = await invoicesCollection.add(docData);
  const doc = await docRef.get();
  return { id: doc.id, ...doc.data() };
}

async function updateInvoice(id, data) {
  const docRef = invoicesCollection.doc(id);
  await docRef.update({
    ...data,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  const updatedDoc = await docRef.get();
  return { id: updatedDoc.id, ...updatedDoc.data() };
}

async function deleteInvoice(id) {
  const docRef = invoicesCollection.doc(id);
  const doc = await docRef.get();
  if (!doc.exists) return null;
  await docRef.delete();
  return { id: doc.id, ...doc.data() };
}

module.exports = {
  getAllInvoices,
  getInvoiceById,
  getInvoicesByClient,
  createInvoice,
  updateInvoice,
  deleteInvoice
};
