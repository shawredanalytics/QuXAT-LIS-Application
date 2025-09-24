const express = require('express');
const { body, query } = require('express-validator');
const userController = require('../controllers/userController');
const { authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users with pagination and filters
// @access  Private (Manager and above)
router.get('/', authorize('admin', 'manager'), [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('role').optional().isIn(['admin', 'lab_technician', 'doctor', 'receptionist', 'manager']),
  query('department').optional().isIn(['hematology', 'chemistry', 'microbiology', 'immunology', 'pathology', 'administration']),
  query('isActive').optional().isBoolean(),
  query('search').optional().trim()
], userController.getUsers);

// @route   GET /api/users/:id
// @desc    Get single user
// @access  Private (Manager and above or own profile)
router.get('/:id', userController.getUser);

// @route   POST /api/users
// @desc    Create new user
// @access  Private (Admin only)
router.post('/', authorize('admin'), [
  body('firstName').trim().isLength({ min: 1 }).withMessage('First name is required'),
  body('lastName').trim().isLength({ min: 1 }).withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['admin', 'lab_technician', 'doctor', 'receptionist', 'manager']).withMessage('Valid role is required'),
  body('department').isIn(['hematology', 'chemistry', 'microbiology', 'immunology', 'pathology', 'administration']).withMessage('Valid department is required'),
  body('employeeId').optional().trim(),
  body('phone').optional().matches(/^\+?[\d\s-()]+$/),
  body('permissions').optional().isArray()
], userController.createUser);

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private (Admin only or own profile for limited fields)
router.put('/:id', [
  body('firstName').optional().trim().isLength({ min: 1 }),
  body('lastName').optional().trim().isLength({ min: 1 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('role').optional().isIn(['admin', 'lab_technician', 'doctor', 'receptionist', 'manager']),
  body('department').optional().isIn(['hematology', 'chemistry', 'microbiology', 'immunology', 'pathology', 'administration']),
  body('phone').optional().matches(/^\+?[\d\s-()]+$/),
  body('isActive').optional().isBoolean(),
  body('permissions').optional().isArray()
], userController.updateUser);

// @route   DELETE /api/users/:id
// @desc    Delete user (soft delete)
// @access  Private (Admin only)
router.delete('/:id', authorize('admin'), userController.deleteUser);

// @route   PUT /api/users/:id/activate
// @desc    Activate user account
// @access  Private (Admin only)
router.put('/:id/activate', authorize('admin'), userController.activateUser);

// @route   PUT /api/users/:id/deactivate
// @desc    Deactivate user account
// @access  Private (Admin only)
router.put('/:id/deactivate', authorize('admin'), userController.deactivateUser);

// @route   PUT /api/users/:id/reset-password
// @desc    Reset user password (Admin only)
// @access  Private (Admin only)
router.put('/:id/reset-password', authorize('admin'), [
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], userController.resetUserPassword);

// @route   PUT /api/users/:id/permissions
// @desc    Update user permissions
// @access  Private (Admin only)
router.put('/:id/permissions', authorize('admin'), [
  body('permissions').isArray().withMessage('Permissions array is required'),
  body('permissions.*').isIn([
    'view_patients', 'create_patients', 'edit_patients', 'delete_patients',
    'view_tests', 'create_tests', 'edit_tests', 'delete_tests',
    'view_results', 'create_results', 'edit_results', 'approve_results',
    'view_reports', 'generate_reports',
    'manage_users', 'system_admin'
  ]).withMessage('Invalid permission')
], userController.updateUserPermissions);

// @route   GET /api/users/:id/activity
// @desc    Get user activity log
// @access  Private (Manager and above or own activity)
router.get('/:id/activity', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('dateFrom').optional().isISO8601(),
  query('dateTo').optional().isISO8601(),
  query('action').optional().trim()
], userController.getUserActivity);

// @route   GET /api/users/stats/dashboard
// @desc    Get user statistics for dashboard
// @access  Private (Manager and above)
router.get('/stats/dashboard', authorize('admin', 'manager'), userController.getUserStats);

// @route   GET /api/users/online/status
// @desc    Get online users status
// @access  Private (Manager and above)
router.get('/online/status', authorize('admin', 'manager'), userController.getOnlineUsers);

// @route   POST /api/users/bulk/import
// @desc    Bulk import users from CSV
// @access  Private (Admin only)
router.post('/bulk/import', authorize('admin'), userController.bulkImportUsers);

// @route   POST /api/users/bulk/update
// @desc    Bulk update users
// @access  Private (Admin only)
router.post('/bulk/update', authorize('admin'), [
  body('userIds').isArray({ min: 1 }).withMessage('User IDs array is required'),
  body('userIds.*').isMongoId().withMessage('Valid user IDs are required'),
  body('updates').isObject().withMessage('Updates object is required')
], userController.bulkUpdateUsers);

// @route   GET /api/users/export/list
// @desc    Export users list
// @access  Private (Admin only)
router.get('/export/list', authorize('admin'), [
  query('format').isIn(['csv', 'excel', 'pdf']).withMessage('Valid format is required'),
  query('includeInactive').optional().isBoolean(),
  query('department').optional().isIn(['hematology', 'chemistry', 'microbiology', 'immunology', 'pathology', 'administration']),
  query('role').optional().isIn(['admin', 'lab_technician', 'doctor', 'receptionist', 'manager'])
], userController.exportUsersList);

module.exports = router;