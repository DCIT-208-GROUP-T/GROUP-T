const express = require('express');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Case = require('../models/Case');
const router = express.Router();

// Get all appointments
router.get('/', async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('clientId', 'fullName email')
      .populate('lawyerId', 'fullName email')
      .populate('caseId', 'title caseType')
      .select('-__v')
      .sort({ date: 1, time: 1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get appointment by ID
router.get('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('clientId', 'fullName email phoneNumber')
      .populate('lawyerId', 'fullName email phoneNumber')
      .populate('caseId', 'title caseType status')
      .select('-__v');
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get appointments by client ID
router.get('/client/:clientId', async (req, res) => {
  try {
    const { status, upcoming } = req.query;
    let query = { clientId: req.params.clientId };
    
    if (status) {
      query.status = status;
    }
    
    if (upcoming === 'true') {
      query.date = { $gte: new Date().toISOString().split('T')[0] };
    }

    const appointments = await Appointment.find(query)
      .populate('lawyerId', 'fullName email')
      .populate('caseId', 'title')
      .select('-__v')
      .sort({ date: 1, time: 1 });
    
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get appointments by lawyer ID
router.get('/lawyer/:lawyerId', async (req, res) => {
  try {
    const { status, upcoming } = req.query;
    let query = { lawyerId: req.params.lawyerId };
    
    if (status) {
      query.status = status;
    }
    
    if (upcoming === 'true') {
      query.date = { $gte: new Date().toISOString().split('T')[0] };
    }

    const appointments = await Appointment.find(query)
      .populate('clientId', 'fullName email phoneNumber')
      .populate('caseId', 'title caseType')
      .select('-__v')
      .sort({ date: 1, time: 1 });
    
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new appointment
router.post('/', async (req, res) => {
  try {
    const { clientId, lawyerId, caseId, date, time } = req.body;
    
    // Verify client, lawyer, and case exist
    const [client, lawyer, caseData] = await Promise.all([
      User.findById(clientId),
      User.findById(lawyerId),
      Case.findById(caseId)
    ]);
    
    if (!client || client.accountType !== 'client') {
      return res.status(400).json({ message: 'Invalid client ID' });
    }
    
    if (!lawyer || lawyer.accountType !== 'lawyer') {
      return res.status(400).json({ message: 'Invalid lawyer ID' });
    }
    
    if (!caseData) {
      return res.status(400).json({ message: 'Invalid case ID' });
    }

    // Check for scheduling conflicts
    const conflictingAppointment = await Appointment.findOne({
      lawyerId,
      date,
      time,
      status: 'scheduled'
    });

    if (conflictingAppointment) {
      return res.status(400).json({ message: 'Time slot already booked' });
    }

    const appointment = new Appointment({
      clientId,
      lawyerId,
      caseId,
      date,
      time
    });

    const savedAppointment = await appointment.save();
    const populatedAppointment = await Appointment.findById(savedAppointment._id)
      .populate('clientId', 'fullName email')
      .populate('lawyerId', 'fullName email')
      .populate('caseId', 'title');
    
    res.status(201).json(populatedAppointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update appointment
router.put('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('clientId', 'fullName email')
      .populate('lawyerId', 'fullName email')
      .populate('caseId', 'title')
      .select('-__v');
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    res.json(appointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete appointment
router.delete('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get appointments by date range
router.get('/date-range/:startDate/:endDate', async (req, res) => {
  try {
    const { lawyerId, clientId } = req.query;
    let query = {
      date: {
        $gte: new Date(req.params.startDate),
        $lte: new Date(req.params.endDate)
      }
    };

    if (lawyerId) {
      query.lawyerId = lawyerId;
    }

    if (clientId) {
      query.clientId = clientId;
    }

    const appointments = await Appointment.find(query)
      .populate('clientId', 'fullName email')
      .populate('lawyerId', 'fullName email')
      .populate('caseId', 'title')
      .select('-__v')
      .sort({ date: 1, time: 1 });
    
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update appointment status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    )
      .populate('clientId', 'fullName email')
      .populate('lawyerId', 'fullName email')
      .select('-__v');
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    res.json(appointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/available-slots/:lawyerId/:date', async (req, res) => {
  try {
    const { lawyerId, date } = req.params;
    const appointments = await Appointment.find({
      lawyerId,
      date: new Date(date),
      status: 'scheduled'
    });

    // Define all possible time slots (example)
    const allTimeSlots = ['9:00 AM', '10:30 AM', '12:00 PM', '2:30 PM', '4:00 PM', '5:30 PM'];
    const bookedSlots = appointments.map(appointment => appointment.time);
    
    // Filter out booked slots
    const availableSlots = allTimeSlots.filter(slot => !bookedSlots.includes(slot));
    
    res.json(availableSlots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
