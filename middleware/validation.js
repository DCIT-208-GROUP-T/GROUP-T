const { body, param, query, validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

// User validation rules
const validateUserCreation = [
  body('firebaseUid')
    .isString()
    .notEmpty()
    .withMessage('Firebase UID is required')
    .isLength({ min: 20, max: 50 })
    .withMessage('Firebase UID must be between 20 and 50 characters'),

  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),

  body('fullName')
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),

  body('accountType')
    .optional()
    .isIn(['client', 'lawyer', 'admin'])
    .withMessage('Account type must be client, lawyer, or admin'),

  body('phoneNumber')
    .optional()
    .isMobilePhone()
    .withMessage('Valid phone number is required'),

  body('profilePicture')
    .optional()
    .isURL()
    .withMessage('Profile picture must be a valid URL'),

  handleValidationErrors
];

const validateUserUpdate = [
  body('fullName')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),

  body('phoneNumber')
    .optional()
    .isMobilePhone()
    .withMessage('Valid phone number is required'),

  body('profilePicture')
    .optional()
    .isURL()
    .withMessage('Profile picture must be a valid URL'),

  handleValidationErrors
];

const validateIdParam = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),

  handleValidationErrors
];

// Case validation rules
const validateCaseCreation = [
  body('title')
    .isString()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title is required and must be less than 200 characters'),

  body('description')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),

  body('clientId')
    .isMongoId()
    .withMessage('Valid client ID is required'),

  body('lawyerId')
    .isMongoId()
    .withMessage('Valid lawyer ID is required'),

  body('caseType')
    .optional()
    .isIn(['criminal', 'civil', 'family', 'corporate', 'real_estate', 'employment', 'intellectual_property', 'other'])
    .withMessage('Invalid case type'),

  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be low, medium, high, or urgent'),

  handleValidationErrors
];

// Appointment validation rules
const validateAppointmentCreation = [
  body('clientId')
    .isMongoId()
    .withMessage('Valid client ID is required'),

  body('lawyerId')
    .isMongoId()
    .withMessage('Valid lawyer ID is required'),

  body('caseId')
    .isMongoId()
    .withMessage('Valid case ID is required'),

  body('date')
    .isISO8601()
    .withMessage('Valid date is required'),

  body('time')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9] (AM|PM)$/)
    .withMessage('Time must be in HH:MM AM/PM format'),

  handleValidationErrors
];

const validateAppointmentStatus = [
  body('status')
    .isIn(['scheduled', 'completed', 'canceled'])
    .withMessage('Status must be scheduled, completed, or canceled'),

  handleValidationErrors
];

const validateDateRange = [
  param('startDate')
    .isISO8601()
    .withMessage('Valid start date is required'),

  param('endDate')
    .isISO8601()
    .withMessage('Valid end date is required'),

  handleValidationErrors
];

const validateDateParam = [
  param('date')
    .isISO8601()
    .withMessage('Valid date is required'),

  handleValidationErrors
];

// Message validation rules
const validateMessageCreation = [
  body('senderId')
    .isMongoId()
    .withMessage('Valid sender ID is required'),

  body('receiverId')
    .isMongoId()
    .withMessage('Valid receiver ID is required'),

  body('caseId')
    .optional()
    .isMongoId()
    .withMessage('Valid case ID is required if provided'),

  body('content')
    .isString()
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Content is required and must be less than 1000 characters'),

  body('messageType')
    .optional()
    .isIn(['text', 'file', 'image'])
    .withMessage('Message type must be text, file, or image'),

  body('fileUrl')
    .optional()
    .isURL()
    .withMessage('File URL must be valid'),

  body('fileName')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 255 })
    .withMessage('File name must be less than 255 characters'),

  handleValidationErrors
];

// Document validation rules
const validateDocumentUpload = [
  body('name')
    .isString()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Document name is required and must be less than 255 characters'),

  body('url')
    .isURL()
    .withMessage('Valid document URL is required'),

  handleValidationErrors
];

// Payment/Invoice validation rules
const validateInvoiceCreation = [
  body('client')
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Client name is required'),

  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),

  body('dueDate')
    .isISO8601()
    .withMessage('Valid due date is required'),

  handleValidationErrors
];

const validateInvoiceStatus = [
  body('paymentStatus')
    .isIn(['pending', 'paid', 'failed'])
    .withMessage('Payment status must be pending, paid, or failed'),

  handleValidationErrors
];

// Notification validation rules
const validateNotificationCreation = [
  body('userId')
    .isMongoId()
    .withMessage('Valid user ID is required'),

  body('title')
    .isString()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title is required and must be less than 200 characters'),

  body('message')
    .isString()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Message is required and must be less than 500 characters'),

  body('type')
    .optional()
    .isIn(['info', 'warning', 'error', 'success'])
    .withMessage('Type must be info, warning, error, or success'),

  handleValidationErrors
];

const validateMessageIds = [
  body('messageIds')
    .isArray({ min: 1 })
    .withMessage('Message IDs must be a non-empty array'),

  body('messageIds.*')
    .isMongoId()
    .withMessage('Each message ID must be valid'),

  handleValidationErrors
];

const validateUserIdParam = [
  param('userId')
    .optional()
    .isMongoId()
    .withMessage('Invalid user ID format'),

  handleValidationErrors
];

module.exports = {
  validateUserCreation,
  validateUserUpdate,
  validateIdParam,
  validateCaseCreation,
  validateAppointmentCreation,
  validateAppointmentStatus,
  validateDateRange,
  validateDateParam,
  validateMessageCreation,
  validateDocumentUpload,
  validateInvoiceCreation,
  validateInvoiceStatus,
  validateNotificationCreation,
  validateMessageIds,
  validateUserIdParam,
  handleValidationErrors
};
