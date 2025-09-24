const express = require('express');
const { body, query } = require('express-validator');
const testController = require('../controllers/testController');
const { authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/tests
// @desc    Get all tests with pagination and filters
// @access  Private
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['ordered', 'collected', 'processing', 'completed', 'cancelled', 'on_hold']),
  query('category').optional().isIn(['hematology', 'chemistry', 'microbiology', 'immunology', 'molecular', 'pathology']),
  query('priority').optional().isIn(['routine', 'urgent', 'stat', 'asap']),
  query('patientId').optional().trim(),
  query('testId').optional().trim(),
  query('dateFrom').optional().isISO8601(),
  query('dateTo').optional().isISO8601()
], testController.getTests);

// @route   GET /api/tests/:id
// @desc    Get single test
// @access  Private
router.get('/:id', testController.getTest);

// @route   POST /api/tests
// @desc    Create new test order
// @access  Private (requires create_tests permission)
router.post('/', authorize('admin', 'manager', 'doctor', 'receptionist'), [
  body('patient').isMongoId().withMessage('Valid patient ID is required'),
  body('testType').isIn([
    'complete_blood_count', 'basic_metabolic_panel', 'lipid_panel',
    'liver_function_test', 'thyroid_function_test', 'urinalysis',
    'blood_glucose', 'hemoglobin_a1c', 'cholesterol', 'triglycerides',
    'creatinine', 'bun', 'electrolytes', 'protein_total', 'albumin',
    'bilirubin', 'alt', 'ast', 'alkaline_phosphatase', 'culture',
    'sensitivity', 'gram_stain', 'covid_19', 'flu_test', 'strep_test',
    'pregnancy_test', 'drug_screen', 'vitamin_d', 'vitamin_b12',
    'folate', 'iron_studies', 'psa', 'cea', 'ca_125', 'ca_19_9',
    'troponin', 'bnp', 'pt_inr', 'ptt', 'esr', 'crp', 'rheumatoid_factor',
    'ana', 'hepatitis_panel', 'hiv_test', 'syphilis_test'
  ]).withMessage('Valid test type is required'),
  body('category').isIn(['hematology', 'chemistry', 'microbiology', 'immunology', 'molecular', 'pathology']).withMessage('Valid category is required'),
  body('sampleType').isIn(['blood', 'urine', 'stool', 'sputum', 'csf', 'synovial_fluid', 'tissue', 'swab', 'other']).withMessage('Valid sample type is required'),
  body('priority').optional().isIn(['routine', 'urgent', 'stat', 'asap']),
  body('fastingRequired').optional().isBoolean(),
  body('fastingHours').optional().isInt({ min: 0, max: 24 }),
  body('clinicalInfo.diagnosis').optional().trim(),
  body('clinicalInfo.symptoms').optional().trim(),
  body('referringPhysician.name').optional().trim(),
  body('referringPhysician.npi').optional().trim(),
  body('specialInstructions').optional().trim()
], testController.createTest);

// @route   PUT /api/tests/:id
// @desc    Update test
// @access  Private (requires edit_tests permission)
router.put('/:id', authorize('admin', 'manager', 'lab_technician'), [
  body('status').optional().isIn(['ordered', 'collected', 'processing', 'completed', 'cancelled', 'on_hold']),
  body('priority').optional().isIn(['routine', 'urgent', 'stat', 'asap']),
  body('collectionDate').optional().isISO8601(),
  body('processingDate').optional().isISO8601(),
  body('completedDate').optional().isISO8601(),
  body('specialInstructions').optional().trim(),
  body('comments').optional().trim()
], testController.updateTest);

// @route   DELETE /api/tests/:id
// @desc    Cancel test
// @access  Private (requires delete_tests permission)
router.delete('/:id', authorize('admin', 'manager'), testController.cancelTest);

// @route   POST /api/tests/:id/collect
// @desc    Mark test as collected
// @access  Private
router.post('/:id/collect', authorize('admin', 'manager', 'lab_technician'), [
  body('collectionDate').optional().isISO8601(),
  body('collectionTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('comments').optional().trim()
], testController.collectSample);

// @route   POST /api/tests/:id/process
// @desc    Mark test as processing
// @access  Private
router.post('/:id/process', authorize('admin', 'manager', 'lab_technician'), [
  body('processingDate').optional().isISO8601(),
  body('comments').optional().trim()
], testController.processTest);

// @route   POST /api/tests/:id/complete
// @desc    Mark test as completed
// @access  Private
router.post('/:id/complete', authorize('admin', 'manager', 'lab_technician'), [
  body('completedDate').optional().isISO8601(),
  body('comments').optional().trim()
], testController.completeTest);

// @route   GET /api/tests/stats/dashboard
// @desc    Get test statistics for dashboard
// @access  Private
router.get('/stats/dashboard', testController.getTestStats);

// @route   GET /api/tests/workload/today
// @desc    Get today's workload
// @access  Private
router.get('/workload/today', testController.getTodayWorkload);

// @route   POST /api/tests/batch/update
// @desc    Batch update tests
// @access  Private (Admin/Manager only)
router.post('/batch/update', authorize('admin', 'manager'), [
  body('testIds').isArray({ min: 1 }).withMessage('Test IDs array is required'),
  body('testIds.*').isMongoId().withMessage('Valid test IDs are required'),
  body('updates').isObject().withMessage('Updates object is required'),
  body('updates.status').optional().isIn(['ordered', 'collected', 'processing', 'completed', 'cancelled', 'on_hold']),
  body('updates.priority').optional().isIn(['routine', 'urgent', 'stat', 'asap'])
], testController.batchUpdateTests);

module.exports = router;