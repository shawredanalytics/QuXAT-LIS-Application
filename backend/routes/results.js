const express = require('express');
const { body, query } = require('express-validator');
const resultController = require('../controllers/resultController');
const { authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/results
// @desc    Get all results with pagination and filters
// @access  Private
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['draft', 'pending_review', 'reviewed', 'approved', 'reported', 'amended']),
  query('overallStatus').optional().isIn(['normal', 'abnormal', 'critical', 'inconclusive']),
  query('patientId').optional().trim(),
  query('testId').optional().trim(),
  query('resultId').optional().trim(),
  query('dateFrom').optional().isISO8601(),
  query('dateTo').optional().isISO8601(),
  query('performedBy').optional().isMongoId()
], resultController.getResults);

// @route   GET /api/results/:id
// @desc    Get single result
// @access  Private
router.get('/:id', resultController.getResult);

// @route   POST /api/results
// @desc    Create new test result
// @access  Private (requires create_results permission)
router.post('/', authorize('admin', 'manager', 'lab_technician'), [
  body('test').isMongoId().withMessage('Valid test ID is required'),
  body('patient').isMongoId().withMessage('Valid patient ID is required'),
  body('testValues').isArray({ min: 1 }).withMessage('Test values are required'),
  body('testValues.*.parameter').isString().withMessage('Parameter name is required'),
  body('testValues.*.value').exists().withMessage('Parameter value is required'),
  body('testValues.*.unit').optional().isString(),
  body('testValues.*.flag').optional().isIn(['normal', 'high', 'low', 'critical_high', 'critical_low', 'abnormal']),
  body('testValues.*.method').optional().isString(),
  body('testValues.*.comments').optional().trim(),
  body('interpretation').optional().trim(),
  body('clinicalSignificance').optional().trim(),
  body('recommendations').optional().trim(),
  body('technicalComments').optional().trim()
], resultController.createResult);

// @route   PUT /api/results/:id
// @desc    Update result
// @access  Private (requires edit_results permission)
router.put('/:id', authorize('admin', 'manager', 'lab_technician'), [
  body('testValues').optional().isArray(),
  body('testValues.*.parameter').optional().isString(),
  body('testValues.*.value').optional().exists(),
  body('testValues.*.unit').optional().isString(),
  body('testValues.*.flag').optional().isIn(['normal', 'high', 'low', 'critical_high', 'critical_low', 'abnormal']),
  body('interpretation').optional().trim(),
  body('clinicalSignificance').optional().trim(),
  body('recommendations').optional().trim(),
  body('technicalComments').optional().trim(),
  body('status').optional().isIn(['draft', 'pending_review', 'reviewed', 'approved', 'reported', 'amended'])
], resultController.updateResult);

// @route   DELETE /api/results/:id
// @desc    Delete result (soft delete)
// @access  Private (Admin only)
router.delete('/:id', authorize('admin'), resultController.deleteResult);

// @route   POST /api/results/:id/review
// @desc    Review result
// @access  Private (requires review permission)
router.post('/:id/review', authorize('admin', 'manager', 'doctor'), [
  body('reviewComments').optional().trim(),
  body('approved').isBoolean().withMessage('Approval status is required')
], resultController.reviewResult);

// @route   POST /api/results/:id/approve
// @desc    Approve result
// @access  Private (requires approve_results permission)
router.post('/:id/approve', authorize('admin', 'manager', 'doctor'), [
  body('approvalComments').optional().trim()
], resultController.approveResult);

// @route   POST /api/results/:id/report
// @desc    Report result to patient/physician
// @access  Private
router.post('/:id/report', authorize('admin', 'manager', 'doctor'), [
  body('reportMethod').optional().isIn(['email', 'fax', 'portal', 'print']),
  body('recipientEmail').optional().isEmail(),
  body('recipientFax').optional().matches(/^\+?[\d\s-()]+$/),
  body('reportComments').optional().trim()
], resultController.reportResult);

// @route   POST /api/results/:id/amend
// @desc    Amend result
// @access  Private (requires edit_results permission)
router.post('/:id/amend', authorize('admin', 'manager', 'lab_technician'), [
  body('amendments').isArray({ min: 1 }).withMessage('Amendments are required'),
  body('amendments.*.parameter').isString().withMessage('Parameter is required'),
  body('amendments.*.originalValue').isString().withMessage('Original value is required'),
  body('amendments.*.newValue').isString().withMessage('New value is required'),
  body('amendments.*.reason').isString().withMessage('Amendment reason is required')
], resultController.amendResult);

// @route   GET /api/results/:id/history
// @desc    Get result amendment history
// @access  Private
router.get('/:id/history', resultController.getResultHistory);

// @route   POST /api/results/:id/critical-notify
// @desc    Notify critical values
// @access  Private
router.post('/:id/critical-notify', authorize('admin', 'manager', 'lab_technician'), [
  body('criticalValues').isArray({ min: 1 }).withMessage('Critical values are required'),
  body('criticalValues.*.parameter').isString().withMessage('Parameter is required'),
  body('criticalValues.*.value').exists().withMessage('Value is required'),
  body('criticalValues.*.notifiedTo').isString().withMessage('Notification recipient is required'),
  body('criticalValues.*.notificationMethod').isIn(['phone', 'email', 'fax', 'in_person']).withMessage('Valid notification method is required')
], resultController.notifyCriticalValues);

// @route   GET /api/results/stats/dashboard
// @desc    Get results statistics for dashboard
// @access  Private
router.get('/stats/dashboard', resultController.getResultStats);

// @route   GET /api/results/pending/review
// @desc    Get results pending review
// @access  Private
router.get('/pending/review', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], resultController.getPendingReview);

// @route   GET /api/results/critical/values
// @desc    Get critical values that need attention
// @access  Private
router.get('/critical/values', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('notified').optional().isBoolean()
], resultController.getCriticalValues);

// @route   POST /api/results/batch/approve
// @desc    Batch approve results
// @access  Private (Manager/Admin only)
router.post('/batch/approve', authorize('admin', 'manager'), [
  body('resultIds').isArray({ min: 1 }).withMessage('Result IDs array is required'),
  body('resultIds.*').isMongoId().withMessage('Valid result IDs are required'),
  body('approvalComments').optional().trim()
], resultController.batchApproveResults);

module.exports = router;