const express = require('express');
const { body, query } = require('express-validator');
const reportController = require('../controllers/reportController');
const { authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/reports/dashboard
// @desc    Get dashboard analytics
// @access  Private
router.get('/dashboard', [
  query('period').optional().isIn(['today', 'week', 'month', 'quarter', 'year']),
  query('dateFrom').optional().isISO8601(),
  query('dateTo').optional().isISO8601()
], reportController.getDashboardAnalytics);

// @route   GET /api/reports/test-volume
// @desc    Get test volume report
// @access  Private
router.get('/test-volume', [
  query('period').optional().isIn(['daily', 'weekly', 'monthly']),
  query('dateFrom').isISO8601().withMessage('Start date is required'),
  query('dateTo').isISO8601().withMessage('End date is required'),
  query('category').optional().isIn(['hematology', 'chemistry', 'microbiology', 'immunology', 'molecular', 'pathology']),
  query('groupBy').optional().isIn(['day', 'week', 'month', 'category', 'status'])
], reportController.getTestVolumeReport);

// @route   GET /api/reports/turnaround-time
// @desc    Get turnaround time analysis
// @access  Private
router.get('/turnaround-time', [
  query('dateFrom').isISO8601().withMessage('Start date is required'),
  query('dateTo').isISO8601().withMessage('End date is required'),
  query('category').optional().isIn(['hematology', 'chemistry', 'microbiology', 'immunology', 'molecular', 'pathology']),
  query('priority').optional().isIn(['routine', 'urgent', 'stat', 'asap']),
  query('testType').optional().trim()
], reportController.getTurnaroundTimeReport);

// @route   GET /api/reports/quality-control
// @desc    Get quality control report
// @access  Private (Lab technician and above)
router.get('/quality-control', authorize('admin', 'manager', 'lab_technician'), [
  query('dateFrom').isISO8601().withMessage('Start date is required'),
  query('dateTo').isISO8601().withMessage('End date is required'),
  query('category').optional().isIn(['hematology', 'chemistry', 'microbiology', 'immunology', 'molecular', 'pathology']),
  query('status').optional().isIn(['passed', 'failed', 'warning'])
], reportController.getQualityControlReport);

// @route   GET /api/reports/critical-values
// @desc    Get critical values report
// @access  Private (Manager and above)
router.get('/critical-values', authorize('admin', 'manager', 'doctor'), [
  query('dateFrom').isISO8601().withMessage('Start date is required'),
  query('dateTo').isISO8601().withMessage('End date is required'),
  query('parameter').optional().trim(),
  query('notificationStatus').optional().isIn(['notified', 'pending', 'all'])
], reportController.getCriticalValuesReport);

// @route   GET /api/reports/patient-summary/:patientId
// @desc    Get comprehensive patient report
// @access  Private
router.get('/patient-summary/:patientId', [
  query('dateFrom').optional().isISO8601(),
  query('dateTo').optional().isISO8601(),
  query('includeHistory').optional().isBoolean(),
  query('format').optional().isIn(['json', 'pdf', 'html'])
], reportController.getPatientSummaryReport);

// @route   GET /api/reports/workload
// @desc    Get staff workload report
// @access  Private (Manager and above)
router.get('/workload', authorize('admin', 'manager'), [
  query('dateFrom').isISO8601().withMessage('Start date is required'),
  query('dateTo').isISO8601().withMessage('End date is required'),
  query('department').optional().isIn(['hematology', 'chemistry', 'microbiology', 'immunology', 'pathology', 'administration']),
  query('userId').optional().isMongoId(),
  query('groupBy').optional().isIn(['user', 'department', 'day', 'week'])
], reportController.getWorkloadReport);

// @route   GET /api/reports/revenue
// @desc    Get revenue analysis report
// @access  Private (Manager and above)
router.get('/revenue', authorize('admin', 'manager'), [
  query('dateFrom').isISO8601().withMessage('Start date is required'),
  query('dateTo').isISO8601().withMessage('End date is required'),
  query('groupBy').optional().isIn(['day', 'week', 'month', 'category', 'test_type']),
  query('includeInsurance').optional().isBoolean()
], reportController.getRevenueReport);

// @route   GET /api/reports/compliance
// @desc    Get regulatory compliance report
// @access  Private (Manager and above)
router.get('/compliance', authorize('admin', 'manager'), [
  query('dateFrom').isISO8601().withMessage('Start date is required'),
  query('dateTo').isISO8601().withMessage('End date is required'),
  query('reportType').optional().isIn(['clia', 'cap', 'iso15189', 'all']),
  query('includeMetrics').optional().isBoolean()
], reportController.getComplianceReport);

// @route   POST /api/reports/custom
// @desc    Generate custom report
// @access  Private (Manager and above)
router.post('/custom', authorize('admin', 'manager'), [
  body('reportName').isString().withMessage('Report name is required'),
  body('dateFrom').isISO8601().withMessage('Start date is required'),
  body('dateTo').isISO8601().withMessage('End date is required'),
  body('filters').isObject().withMessage('Filters object is required'),
  body('groupBy').optional().isArray(),
  body('metrics').isArray({ min: 1 }).withMessage('At least one metric is required'),
  body('format').optional().isIn(['json', 'csv', 'pdf', 'excel'])
], reportController.generateCustomReport);

// @route   GET /api/reports/export/:reportId
// @desc    Export report in various formats
// @access  Private
router.get('/export/:reportId', [
  query('format').isIn(['pdf', 'csv', 'excel', 'json']).withMessage('Valid format is required'),
  query('includeCharts').optional().isBoolean(),
  query('template').optional().isIn(['standard', 'detailed', 'summary'])
], reportController.exportReport);

// @route   GET /api/reports/scheduled
// @desc    Get scheduled reports
// @access  Private (Manager and above)
router.get('/scheduled', authorize('admin', 'manager'), reportController.getScheduledReports);

// @route   POST /api/reports/schedule
// @desc    Schedule recurring report
// @access  Private (Manager and above)
router.post('/schedule', authorize('admin', 'manager'), [
  body('reportType').isString().withMessage('Report type is required'),
  body('frequency').isIn(['daily', 'weekly', 'monthly', 'quarterly']).withMessage('Valid frequency is required'),
  body('recipients').isArray({ min: 1 }).withMessage('At least one recipient is required'),
  body('recipients.*').isEmail().withMessage('Valid email addresses are required'),
  body('parameters').isObject().withMessage('Report parameters are required'),
  body('format').optional().isIn(['pdf', 'csv', 'excel']),
  body('isActive').optional().isBoolean()
], reportController.scheduleReport);

// @route   PUT /api/reports/schedule/:scheduleId
// @desc    Update scheduled report
// @access  Private (Manager and above)
router.put('/schedule/:scheduleId', authorize('admin', 'manager'), [
  body('frequency').optional().isIn(['daily', 'weekly', 'monthly', 'quarterly']),
  body('recipients').optional().isArray(),
  body('recipients.*').optional().isEmail(),
  body('parameters').optional().isObject(),
  body('isActive').optional().isBoolean()
], reportController.updateScheduledReport);

// @route   DELETE /api/reports/schedule/:scheduleId
// @desc    Delete scheduled report
// @access  Private (Manager and above)
router.delete('/schedule/:scheduleId', authorize('admin', 'manager'), reportController.deleteScheduledReport);

module.exports = router;