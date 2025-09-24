const { validationResult } = require('express-validator');
const Result = require('../models/Result');
const Test = require('../models/Test');
const Patient = require('../models/Patient');
const moment = require('moment');

// @desc    Get all results with pagination and filters
// @route   GET /api/results
// @access  Private
exports.getResults = async (req, res) => {
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
    const filter = { isActive: true };

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.overallStatus) {
      filter.overallStatus = req.query.overallStatus;
    }

    if (req.query.dateFrom || req.query.dateTo) {
      filter.performedDate = {};
      if (req.query.dateFrom) {
        filter.performedDate.$gte = new Date(req.query.dateFrom);
      }
      if (req.query.dateTo) {
        filter.performedDate.$lte = new Date(req.query.dateTo);
      }
    }

    if (req.query.search) {
      // Search in result ID or populate patient/test data
      const searchRegex = { $regex: req.query.search, $options: 'i' };
      filter.$or = [
        { resultId: searchRegex }
      ];
    }

    const results = await Result.find(filter)
      .populate({
        path: 'test',
        populate: {
          path: 'patient',
          select: 'firstName lastName patientId dateOfBirth'
        }
      })
      .populate('performedBy', 'firstName lastName')
      .populate('reviewedBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Result.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: results,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get results error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single result
// @route   GET /api/results/:id
// @access  Private
exports.getResult = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate({
        path: 'test',
        populate: {
          path: 'patient',
          select: 'firstName lastName patientId dateOfBirth gender phone address'
        }
      })
      .populate('performedBy', 'firstName lastName')
      .populate('reviewedBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName');

    if (!result || !result.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Result not found'
      });
    }

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get result error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create new result
// @route   POST /api/results
// @access  Private
exports.createResult = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    // Verify test exists and is completed
    const test = await Test.findById(req.body.test).populate('patient');
    if (!test || !test.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }

    if (test.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Results can only be created for completed tests'
      });
    }

    // Check if result already exists for this test
    const existingResult = await Result.findOne({ test: req.body.test, isActive: true });
    if (existingResult) {
      return res.status(400).json({
        success: false,
        message: 'Result already exists for this test'
      });
    }

    const resultData = {
      ...req.body,
      patient: test.patient._id,
      performedBy: req.user.id,
      performedDate: new Date(),
      status: 'draft'
    };

    const result = await Result.create(resultData);
    await result.populate('test');
    await result.populate('performedBy', 'firstName lastName');

    res.status(201).json({
      success: true,
      data: result,
      message: 'Result created successfully'
    });
  } catch (error) {
    console.error('Create result error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update result
// @route   PUT /api/results/:id
// @access  Private
exports.updateResult = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    let result = await Result.findById(req.params.id);
    if (!result || !result.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Result not found'
      });
    }

    // Check if result can be updated based on status
    if (['reported', 'archived'].includes(result.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update reported or archived results'
      });
    }

    result = await Result.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('test')
     .populate('performedBy', 'firstName lastName');

    res.status(200).json({
      success: true,
      data: result,
      message: 'Result updated successfully'
    });
  } catch (error) {
    console.error('Update result error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Review result
// @route   PUT /api/results/:id/review
// @access  Private
exports.reviewResult = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id);
    if (!result || !result.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Result not found'
      });
    }

    if (result.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Only draft results can be reviewed'
      });
    }

    result.status = 'reviewed';
    result.reviewedBy = req.user.id;
    result.reviewedDate = new Date();
    
    if (req.body.reviewComments) {
      result.reviewComments = req.body.reviewComments;
    }

    await result.save();
    await result.populate('reviewedBy', 'firstName lastName');

    res.status(200).json({
      success: true,
      data: result,
      message: 'Result reviewed successfully'
    });
  } catch (error) {
    console.error('Review result error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Approve result
// @route   PUT /api/results/:id/approve
// @access  Private
exports.approveResult = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id);
    if (!result || !result.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Result not found'
      });
    }

    if (result.status !== 'reviewed') {
      return res.status(400).json({
        success: false,
        message: 'Only reviewed results can be approved'
      });
    }

    result.status = 'approved';
    result.approvedBy = req.user.id;
    result.approvedDate = new Date();
    
    if (req.body.approvalComments) {
      result.approvalComments = req.body.approvalComments;
    }

    await result.save();
    await result.populate('approvedBy', 'firstName lastName');

    res.status(200).json({
      success: true,
      data: result,
      message: 'Result approved successfully'
    });
  } catch (error) {
    console.error('Approve result error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Report result
// @route   PUT /api/results/:id/report
// @access  Private
exports.reportResult = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id);
    if (!result || !result.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Result not found'
      });
    }

    if (result.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Only approved results can be reported'
      });
    }

    result.status = 'reported';
    result.reportedDate = new Date();

    await result.save();

    res.status(200).json({
      success: true,
      data: result,
      message: 'Result reported successfully'
    });
  } catch (error) {
    console.error('Report result error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Amend result
// @route   PUT /api/results/:id/amend
// @access  Private
exports.amendResult = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const result = await Result.findById(req.params.id);
    if (!result || !result.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Result not found'
      });
    }

    if (result.status !== 'reported') {
      return res.status(400).json({
        success: false,
        message: 'Only reported results can be amended'
      });
    }

    // Store amendment history
    const amendment = {
      amendedBy: req.user.id,
      amendedDate: new Date(),
      reason: req.body.reason,
      previousValues: req.body.previousValues,
      newValues: req.body.newValues
    };

    result.amendments.push(amendment);
    
    // Update the result with new values
    if (req.body.testValues) {
      result.testValues = req.body.testValues;
    }
    
    if (req.body.interpretation) {
      result.interpretation = req.body.interpretation;
    }

    await result.save();
    await result.populate('amendments.amendedBy', 'firstName lastName');

    res.status(200).json({
      success: true,
      data: result,
      message: 'Result amended successfully'
    });
  } catch (error) {
    console.error('Amend result error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get amendment history
// @route   GET /api/results/:id/amendments
// @access  Private
exports.getAmendmentHistory = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate('amendments.amendedBy', 'firstName lastName')
      .select('amendments');

    if (!result || !result.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Result not found'
      });
    }

    res.status(200).json({
      success: true,
      data: result.amendments
    });
  } catch (error) {
    console.error('Get amendment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Notify critical values
// @route   POST /api/results/:id/notify-critical
// @access  Private
exports.notifyCriticalValues = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate('test')
      .populate({
        path: 'test',
        populate: {
          path: 'patient',
          select: 'firstName lastName patientId phone'
        }
      });

    if (!result || !result.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Result not found'
      });
    }

    // Check if result has critical values
    const criticalValues = result.testValues.filter(value => 
      value.flags && value.flags.includes('critical')
    );

    if (criticalValues.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No critical values found in this result'
      });
    }

    // Here you would implement notification logic (email, SMS, etc.)
    // For now, we'll just log the notification
    console.log('Critical value notification:', {
      patient: result.test.patient.fullName,
      patientId: result.test.patient.patientId,
      criticalValues: criticalValues.map(v => ({
        parameter: v.parameter,
        value: v.value,
        unit: v.unit
      }))
    });

    result.criticalValueNotified = true;
    result.criticalValueNotificationDate = new Date();
    await result.save();

    res.status(200).json({
      success: true,
      message: 'Critical value notification sent successfully'
    });
  } catch (error) {
    console.error('Notify critical values error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/results/stats/dashboard
// @access  Private
exports.getResultStats = async (req, res) => {
  try {
    const today = moment().startOf('day');
    const thisWeek = moment().startOf('week');
    const thisMonth = moment().startOf('month');

    const stats = await Promise.all([
      // Today's results
      Result.countDocuments({
        isActive: true,
        createdAt: { $gte: today.toDate() }
      }),
      
      // This week's results
      Result.countDocuments({
        isActive: true,
        createdAt: { $gte: thisWeek.toDate() }
      }),
      
      // This month's results
      Result.countDocuments({
        isActive: true,
        createdAt: { $gte: thisMonth.toDate() }
      }),
      
      // Results by status
      Result.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      
      // Results by overall status
      Result.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$overallStatus', count: { $sum: 1 } } }
      ]),
      
      // Critical values count
      Result.countDocuments({
        isActive: true,
        'testValues.flags': 'critical'
      }),
      
      // Pending reviews
      Result.countDocuments({
        isActive: true,
        status: 'draft'
      }),
      
      // Pending approvals
      Result.countDocuments({
        isActive: true,
        status: 'reviewed'
      })
    ]);

    res.status(200).json({
      success: true,
      data: {
        todayResults: stats[0],
        weekResults: stats[1],
        monthResults: stats[2],
        statusBreakdown: stats[3],
        overallStatusBreakdown: stats[4],
        criticalValues: stats[5],
        pendingReviews: stats[6],
        pendingApprovals: stats[7]
      }
    });
  } catch (error) {
    console.error('Get result stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get pending reviews
// @route   GET /api/results/pending/reviews
// @access  Private
exports.getPendingReviews = async (req, res) => {
  try {
    const pendingReviews = await Result.find({
      isActive: true,
      status: 'draft'
    })
    .populate({
      path: 'test',
      populate: {
        path: 'patient',
        select: 'firstName lastName patientId'
      }
    })
    .populate('performedBy', 'firstName lastName')
    .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      data: pendingReviews
    });
  } catch (error) {
    console.error('Get pending reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get critical values
// @route   GET /api/results/critical/values
// @access  Private
exports.getCriticalValues = async (req, res) => {
  try {
    const criticalResults = await Result.find({
      isActive: true,
      'testValues.flags': 'critical'
    })
    .populate({
      path: 'test',
      populate: {
        path: 'patient',
        select: 'firstName lastName patientId phone'
      }
    })
    .populate('performedBy', 'firstName lastName')
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: criticalResults
    });
  } catch (error) {
    console.error('Get critical values error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Batch approve results
// @route   PUT /api/results/batch/approve
// @access  Private
exports.batchApproveResults = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { resultIds } = req.body;

    const result = await Result.updateMany(
      { 
        _id: { $in: resultIds }, 
        isActive: true,
        status: 'reviewed'
      },
      {
        status: 'approved',
        approvedBy: req.user.id,
        approvedDate: new Date()
      }
    );

    res.status(200).json({
      success: true,
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount
      },
      message: `${result.modifiedCount} results approved successfully`
    });
  } catch (error) {
    console.error('Batch approve results error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete result (soft delete)
// @route   DELETE /api/results/:id
// @access  Private
exports.deleteResult = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id);
    if (!result || !result.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Result not found'
      });
    }

    if (['reported', 'archived'].includes(result.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete reported or archived results'
      });
    }

    result.isActive = false;
    await result.save();

    res.status(200).json({
      success: true,
      message: 'Result deleted successfully'
    });
  } catch (error) {
    console.error('Delete result error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};