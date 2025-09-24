const { validationResult } = require('express-validator');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const moment = require('moment');

// @desc    Get all users with pagination and filters
// @route   GET /api/users
// @access  Private (Manager and above)
exports.getUsers = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};

    if (req.query.role) {
      filter.role = req.query.role;
    }

    if (req.query.department) {
      filter.department = req.query.department;
    }

    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }

    if (req.query.search) {
      filter.$or = [
        { firstName: { $regex: req.query.search, $options: 'i' } },
        { lastName: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { employeeId: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private (Manager and above or own profile)
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user can access this profile
    if (req.user.id !== req.params.id && 
        !['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create new user
// @route   POST /api/users
// @access  Private (Admin only)
exports.createUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Check if employee ID already exists
    if (req.body.employeeId) {
      const existingEmployee = await User.findOne({ employeeId: req.body.employeeId });
      if (existingEmployee) {
        return res.status(400).json({
          success: false,
          message: 'User with this employee ID already exists'
        });
      }
    }

    const user = await User.create(req.body);

    // Remove password from response
    user.password = undefined;

    res.status(201).json({
      success: true,
      data: user,
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin only or own profile for limited fields)
exports.updateUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check permissions
    const isOwnProfile = req.user.id === req.params.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwnProfile && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // If updating own profile, restrict certain fields
    if (isOwnProfile && !isAdmin) {
      const allowedFields = ['firstName', 'lastName', 'phone', 'profileImage'];
      const updateData = {};
      
      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      });
      
      req.body = updateData;
    }

    // Check if email is being changed and if it already exists
    if (req.body.email && req.body.email !== user.email) {
      const existingUser = await User.findOne({ email: req.body.email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }
    }

    // Check if employee ID is being changed and if it already exists
    if (req.body.employeeId && req.body.employeeId !== user.employeeId) {
      const existingEmployee = await User.findOne({ employeeId: req.body.employeeId });
      if (existingEmployee) {
        return res.status(400).json({
          success: false,
          message: 'User with this employee ID already exists'
        });
      }
    }

    user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      data: user,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete user (soft delete)
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deleting own account
    if (req.user.id === req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Activate user account
// @route   PUT /api/users/:id/activate
// @access  Private (Admin only)
exports.activateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = true;
    await user.save();

    res.status(200).json({
      success: true,
      data: user,
      message: 'User activated successfully'
    });
  } catch (error) {
    console.error('Activate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Deactivate user account
// @route   PUT /api/users/:id/deactivate
// @access  Private (Admin only)
exports.deactivateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deactivating own account
    if (req.user.id === req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate your own account'
      });
    }

    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      data: user,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Reset user password (Admin only)
// @route   PUT /api/users/:id/reset-password
// @access  Private (Admin only)
exports.resetUserPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.newPassword, salt);
    
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Reset user password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update user permissions
// @route   PUT /api/users/:id/permissions
// @access  Private (Admin only)
exports.updateUserPermissions = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.permissions = req.body.permissions;
    await user.save();

    res.status(200).json({
      success: true,
      data: user,
      message: 'User permissions updated successfully'
    });
  } catch (error) {
    console.error('Update user permissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get user activity log
// @route   GET /api/users/:id/activity
// @access  Private (Manager and above or own activity)
exports.getUserActivity = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    // Check permissions
    const isOwnActivity = req.user.id === req.params.id;
    const hasPermission = ['admin', 'manager'].includes(req.user.role);

    if (!isOwnActivity && !hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // This is a placeholder for activity logging
    // In a real implementation, you would have an activity log collection
    res.status(200).json({
      success: true,
      data: [],
      message: 'Activity logging not implemented yet'
    });
  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get user statistics for dashboard
// @route   GET /api/users/stats/dashboard
// @access  Private (Manager and above)
exports.getUserStats = async (req, res) => {
  try {
    const today = moment().startOf('day');
    const thisWeek = moment().startOf('week');
    const thisMonth = moment().startOf('month');

    const stats = await Promise.all([
      // Total users
      User.countDocuments({ isActive: true }),
      
      // New users today
      User.countDocuments({
        isActive: true,
        createdAt: { $gte: today.toDate() }
      }),
      
      // New users this week
      User.countDocuments({
        isActive: true,
        createdAt: { $gte: thisWeek.toDate() }
      }),
      
      // New users this month
      User.countDocuments({
        isActive: true,
        createdAt: { $gte: thisMonth.toDate() }
      }),
      
      // Users by role
      User.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ]),
      
      // Users by department
      User.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$department', count: { $sum: 1 } } }
      ]),
      
      // Active users (logged in within last 30 days)
      User.countDocuments({
        isActive: true,
        lastLogin: { $gte: moment().subtract(30, 'days').toDate() }
      })
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers: stats[0],
        newUsersToday: stats[1],
        newUsersWeek: stats[2],
        newUsersMonth: stats[3],
        roleBreakdown: stats[4],
        departmentBreakdown: stats[5],
        activeUsers: stats[6]
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get online users status
// @route   GET /api/users/online/status
// @access  Private (Manager and above)
exports.getOnlineUsers = async (req, res) => {
  try {
    // This is a placeholder for online user tracking
    // In a real implementation, you would track user sessions/websocket connections
    const onlineUsers = await User.find({
      isActive: true,
      lastLogin: { $gte: moment().subtract(15, 'minutes').toDate() }
    }).select('firstName lastName role department lastLogin');

    res.status(200).json({
      success: true,
      data: onlineUsers
    });
  } catch (error) {
    console.error('Get online users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Bulk import users from CSV
// @route   POST /api/users/bulk/import
// @access  Private (Admin only)
exports.bulkImportUsers = async (req, res) => {
  try {
    // This is a placeholder for bulk import functionality
    // In a real implementation, you would parse CSV data and create users
    res.status(200).json({
      success: true,
      message: 'Bulk import functionality not implemented yet'
    });
  } catch (error) {
    console.error('Bulk import users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Bulk update users
// @route   POST /api/users/bulk/update
// @access  Private (Admin only)
exports.bulkUpdateUsers = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { userIds, updates } = req.body;

    const result = await User.updateMany(
      { _id: { $in: userIds } },
      updates,
      { runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount
      },
      message: `${result.modifiedCount} users updated successfully`
    });
  } catch (error) {
    console.error('Bulk update users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Export users list
// @route   GET /api/users/export/list
// @access  Private (Admin only)
exports.exportUsersList = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    // This is a placeholder for export functionality
    // In a real implementation, you would generate CSV, Excel, or PDF files
    const { format } = req.query;
    
    res.status(200).json({
      success: true,
      message: `Users list export in ${format} format initiated`,
      downloadUrl: `/downloads/users/users_${Date.now()}.${format}`
    });
  } catch (error) {
    console.error('Export users list error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};