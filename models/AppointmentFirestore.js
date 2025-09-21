const admin = require('firebase-admin');
const db = admin.firestore();
const appointmentsCollection = db.collection('appointments');

async function createAppointment(appointmentData) {
  const appointmentRef = appointmentsCollection.doc();
  const newAppointment = {
    ...appointmentData,
    id: appointmentRef.id,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  await appointmentRef.set(newAppointment);
  return newAppointment;
}

async function getAppointmentById(appointmentId) {
  const appointmentDoc = await appointmentsCollection.doc(appointmentId).get();
  if (!appointmentDoc.exists) {
    return null;
  }
  return { id: appointmentDoc.id, ...appointmentDoc.data() };
}

async function updateAppointment(appointmentId, updateData) {
  const appointmentRef = appointmentsCollection.doc(appointmentId);
  await appointmentRef.update({
    ...updateData,
    updatedAt: new Date()
  });
  const updatedDoc = await appointmentRef.get();
  return { id: updatedDoc.id, ...updatedDoc.data() };
}

async function deleteAppointment(appointmentId) {
  await appointmentsCollection.doc(appointmentId).delete();
}

async function getAppointmentsByClient(clientId) {
  const querySnapshot = await appointmentsCollection.where('clientId', '==', clientId).get();
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function getAppointmentsByLawyer(lawyerId) {
  const querySnapshot = await appointmentsCollection.where('lawyerId', '==', lawyerId).get();
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function getUpcomingAppointments(clientId) {
  const now = new Date();
  const querySnapshot = await appointmentsCollection
    .where('clientId', '==', clientId)
    .where('date', '>=', now)
    .where('status', '==', 'scheduled')
    .get();
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

module.exports = {
  createAppointment,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  getAppointmentsByClient,
  getAppointmentsByLawyer,
  getUpcomingAppointments
};
