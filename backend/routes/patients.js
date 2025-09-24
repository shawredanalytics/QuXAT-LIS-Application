const express = require('express');
const { body, query } = require('express-validator');
const patientController = require('../controllers/patientController');
const { authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/patients
// @desc    Get all patients with pagination and search
// @access  Private
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().trim(),
  query('gender').optional().isIn(['male', 'female', 'other']),
  query('isActive').optional().isBoolean()
], patientController.getPatients);

// @route   GET /api/patients/:id
// @desc    Get single patient
// @access  Private
router.get('/:id', patientController.getPatient);

// @route   POST /api/patients
// @desc    Create new patient
// @access  Private (requires create_patients permission)
router.post('/', authorize('admin', 'manager', 'receptionist'), [
  body('firstName').trim().isLength({ min: 1 }).withMessage('First name is required'),
  body('lastName').trim().isLength({ min: 1 }).withMessage('Last name is required'),
  body('dateOfBirth').isISO8601().withMessage('Valid date of birth is required'),
  body('gender').isIn(['male', 'female', 'other']).withMessage('Valid gender is required'),
  body('phone').matches(/^\+?[\d\s-()]+$/).withMessage('Valid phone number is required'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('address.street').optional().trim(),
  body('address.city').optional().trim(),
  body('address.state').optional().trim(),
  body('address.zipCode').optional().trim(),
  body('emergencyContact.name').optional().trim(),
  body('emergencyContact.phone').optional().matches(/^\+?[\d\s-()]+$/),
  body('insurance.provider').optional().trim(),
  body('insurance.policyNumber').optional().trim()
], patientController.createPatient);

// @route   PUT /api/patients/:id
// @desc    Update patient
// @access  Private (requires edit_patients permission)
router.put('/:id', authorize('admin', 'manager', 'receptionist'), [
  body('firstName').optional().trim().isLength({ min: 1 }),
  body('lastName').optional().trim().isLength({ min: 1 }),
  body('dateOfBirth').optional().isISO8601(),
  body('gender').optional().isIn(['male', 'female', 'other']),
  body('phone').optional().matches(/^\+?[\d\s-()]+$/),
  body('email').optional().isEmail().normalizeEmail()
], patientController.updatePatient);

// @route   DELETE /api/patients/:id
// @desc    Delete patient (soft delete)
// @access  Private (requires delete_patients permission)
router.delete('/:id', authorize('admin', 'manager'), patientController.deletePatient);

// @route   GET /api/patients/:id/tests
// @desc    Get patient's test history
// @access  Private
router.get('/:id/tests', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['ordered', 'collected', 'processing', 'completed', 'cancelled']),
  query('category').optional().isIn(['hematology', 'chemistry', 'microbiology', 'immunology', 'molecular', 'pathology'])
], patientController.getPatientTests);

// @route   GET /api/patients/:id/results
// @desc    Get patient's test results
// @access  Private
router.get('/:id/results', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['draft', 'pending_review', 'reviewed', 'approved', 'reported']),
  query('overallStatus').optional().isIn(['normal', 'abnormal', 'critical', 'inconclusive'])
], patientController.getPatientResults);

// @route   POST /api/patients/search
// @desc    Advanced patient search
// @access  Private
router.post('/search', [
  body('criteria').isObject().withMessage('Search criteria is required'),
  body('criteria.firstName').optional().trim(),
  body('criteria.lastName').optional().trim(),
  body('criteria.patientId').optional().trim(),
  body('criteria.phone').optional().trim(),
  body('criteria.email').optional().isEmail().normalizeEmail(),
  body('criteria.dateOfBirth').optional().isISO8601(),
  body('criteria.ageRange.min').optional().isInt({ min: 0 }),
  body('criteria.ageRange.max').optional().isInt({ min: 0 })
], patientController.searchPatients);

module.exports = router;