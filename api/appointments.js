const express = require('express');
const {
  createAppointment,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  getAppointmentsByClient,
  getAppointmentsByLawyer,
  getUpcomingAppointments
} = require('../models/AppointmentFirestore');
const {
  validateAppointmentCreation,
  validateIdParam,
  validateStatusUpdate,
  validateDateRange,
  validateDateParam
} = require('../middleware/validation');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    // For now, return empty array as we don't have a getAllAppointments function
    res.json([]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', validateIdParam, async (req, res) => {
  try {
    const appointment = await getAppointmentById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/client/:clientId?', async (req, res) => {
  try {
    if (!req.params.clientId) {
      if (!req.user) return res.status(401).json({ message: 'Authentication required' });
      req.params.clientId = req.user.id;
    }
    const { status, upcoming } = req.query;

    let appointments;
    if (upcoming === 'true') {
      appointments = await getUpcomingAppointments(req.params.clientId);
    } else {
      appointments = await getAppointmentsByClient(req.params.clientId);
    }

    // Filter by status if provided
    if (status) {
      appointments = appointments.filter(app => app.status === status);
    }

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/lawyer/:lawyerId', validateIdParam, async (req, res) => {
  try {
    const appointments = await getAppointmentsByLawyer(req.params.lawyerId);
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', validateAppointmentCreation, async (req, res) => {
  try {
    const { clientId, lawyerId, caseId, date, time } = req.body;

    // Assume IDs are valid Firestore document IDs

    const appointmentData = {
      clientId,
      lawyerId,
      caseId,
      date: new Date(date),
      time,
      status: 'scheduled'
    };

    const newAppointment = await createAppointment(appointmentData);
    res.status(201).json(newAppointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', validateIdParam, async (req, res) => {
  try {
    const updatedAppointment = await updateAppointment(req.params.id, req.body);
    if (!updatedAppointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json(updatedAppointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', validateIdParam, async (req, res) => {
  try {
    await deleteAppointment(req.params.id);
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Note: Date range and available slots endpoints need to be implemented with Firestore queries
// For now, returning empty responses

router.get('/date-range/:startDate/:endDate', async (req, res) => {
  try {
    res.json([]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/:id/status', validateIdParam, validateStatusUpdate, async (req, res) => {
  try {
    const { status } = req.body;
    const updatedAppointment = await updateAppointment(req.params.id, { status });
    if (!updatedAppointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json(updatedAppointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/available-slots/:lawyerId/:date', async (req, res) => {
  try {
    // Define all possible time slots (example)
    const allTimeSlots = ['9:00 AM', '10:30 AM', '12:00 PM', '2:30 PM', '4:00 PM', '5:30 PM'];
    res.json(allTimeSlots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


