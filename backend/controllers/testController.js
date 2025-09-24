const { validationResult } = require('express-validator');
const Test = require('../models/Test');
const Patient = require('../models/Patient');
const Result = require('../models/Result');
const moment = require('moment');

// @desc    Get all tests with pagination and filters
// @route   GET /api/tests
// @access  Private
exports.getTests = async (req, res) => {
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

    if (req.query.priority) {
      filter.priority = req.query.priority;
    }

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.testType) {
      filter.testType = { $regex: req.query.testType, $options: 'i' };
    }

    if (req.query.dateFrom || req.query.dateTo) {
      filter.createdAt = {};
      if (req.query.dateFrom) {
        filter.createdAt.$gte = new Date(req.query.dateFrom);
      }
      if (req.query.dateTo) {
        filter.createdAt.$lte = new Date(req.query.dateTo);
      }
    }

    if (req.query.search) {
      filter.$or = [
        { testId: { $regex: req.query.search, $options: 'i' } },
        { sampleId: { $regex: req.query.search, $options: 'i' } },
        { testType: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const tests = await Test.find(filter)
      .populate('patient', 'firstName lastName patientId dateOfBirth')
      .populate('orderedBy', 'firstName lastName')
      .populate('collectedBy', 'firstName lastName')
      .populate('processedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Test.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: tests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get tests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single test
// @route   GET /api/tests/:id
// @access  Private
exports.getTest = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id)
      .populate('patient')
      .populate('orderedBy', 'firstName lastName')
      .populate('collectedBy', 'firstName lastName')
      .populate('processedBy', 'firstName lastName')
      .populate('referringPhysician.physician', 'firstName lastName');

    if (!test || !test.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }

    res.status(200).json({
      success: true,
      data: test
    });
  } catch (error) {
    console.error('Get test error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create new test
// @route   POST /api/tests
// @access  Private
exports.createTest = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    // Verify patient exists
    const patient = await Patient.findById(req.body.patient);
    if (!patient || !patient.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    const testData = {
      ...req.body,
      orderedBy: req.user.id,
      status: 'ordered'
    };

    const test = await Test.create(testData);
    await test.populate('patient', 'firstName lastName patientId');
    await test.populate('orderedBy', 'firstName lastName');

    res.status(201).json({
      success: true,
      data: test,
      message: 'Test ordered successfully'
    });
  } catch (error) {
    console.error('Create test error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update test
// @route   PUT /api/tests/:id
// @access  Private
exports.updateTest = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    let test = await Test.findById(req.params.id);
    if (!test || !test.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }

    // Check if test can be updated based on status
    if (['completed', 'cancelled'].includes(test.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update completed or cancelled test'
      });
    }

    test = await Test.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('patient', 'firstName lastName patientId')
     .populate('orderedBy', 'firstName lastName');

    res.status(200).json({
      success: true,
      data: test,
      message: 'Test updated successfully'
    });
  } catch (error) {
    console.error('Update test error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Cancel test
// @route   PUT /api/tests/:id/cancel
// @access  Private
exports.cancelTest = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test || !test.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }

    if (['completed', 'cancelled'].includes(test.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel completed or already cancelled test'
      });
    }

    test.status = 'cancelled';
    test.comments = req.body.reason || 'Test cancelled';
    await test.save();

    res.status(200).json({
      success: true,
      data: test,
      message: 'Test cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel test error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Mark test as collected
// @route   PUT /api/tests/:id/collect
// @access  Private
exports.collectSample = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test || !test.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }

    if (test.status !== 'ordered') {
      return res.status(400).json({
        success: false,
        message: 'Sample can only be collected for ordered tests'
      });
    }

    test.status = 'collected';
    test.collectedBy = req.user.id;
    test.collectionDate = new Date();
    test.sampleCondition = req.body.sampleCondition || 'good';
    
    if (req.body.comments) {
      test.comments = req.body.comments;
    }

    await test.save();
    await test.populate('collectedBy', 'firstName lastName');

    res.status(200).json({
      success: true,
      data: test,
      message: 'Sample collected successfully'
    });
  } catch (error) {
    console.error('Collect sample error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Mark test as processing
// @route   PUT /api/tests/:id/process
// @access  Private
exports.processTest = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test || !test.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }

    if (test.status !== 'collected') {
      return res.status(400).json({
        success: false,
        message: 'Test can only be processed after sample collection'
      });
    }

    test.status = 'processing';
    test.processedBy = req.user.id;
    test.processingDate = new Date();
    
    if (req.body.comments) {
      test.comments = req.body.comments;
    }

    await test.save();
    await test.populate('processedBy', 'firstName lastName');

    res.status(200).json({
      success: true,
      data: test,
      message: 'Test processing started'
    });
  } catch (error) {
    console.error('Process test error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Mark test as completed
// @route   PUT /api/tests/:id/complete
// @access  Private
exports.completeTest = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test || !test.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }

    if (test.status !== 'processing') {
      return res.status(400).json({
        success: false,
        message: 'Test can only be completed from processing status'
      });
    }

    test.status = 'completed';
    test.actualCompletionDate = new Date();
    
    // Calculate turnaround time
    if (test.collectionDate) {
      const turnaroundHours = moment(test.actualCompletionDate).diff(moment(test.collectionDate), 'hours');
      test.turnaroundTime = turnaroundHours;
    }

    if (req.body.comments) {
      test.comments = req.body.comments;
    }

    await test.save();

    res.status(200).json({
      success: true,
      data: test,
      message: 'Test completed successfully'
    });
  } catch (error) {
    console.error('Complete test error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get test statistics for dashboard
// @route   GET /api/tests/stats/dashboard
// @access  Private
exports.getTestStats = async (req, res) => {
  try {
    const today = moment().startOf('day');
    const thisWeek = moment().startOf('week');
    const thisMonth = moment().startOf('month');

    const stats = await Promise.all([
      // Today's tests
      Test.countDocuments({
        isActive: true,
        createdAt: { $gte: today.toDate() }
      }),
      
      // This week's tests
      Test.countDocuments({
        isActive: true,
        createdAt: { $gte: thisWeek.toDate() }
      }),
      
      // This month's tests
      Test.countDocuments({
        isActive: true,
        createdAt: { $gte: thisMonth.toDate() }
      }),
      
      // Tests by status
      Test.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      
      // Tests by priority
      Test.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ]),
      
      // Tests by category
      Test.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),
      
      // Average turnaround time
      Test.aggregate([
        { 
          $match: { 
            isActive: true, 
            status: 'completed',
            turnaroundTime: { $exists: true, $ne: null }
          } 
        },
        { 
          $group: { 
            _id: null, 
            avgTurnaround: { $avg: '$turnaroundTime' },
            count: { $sum: 1 }
          } 
        }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        todayTests: stats[0],
        weekTests: stats[1],
        monthTests: stats[2],
        statusBreakdown: stats[3],
        priorityBreakdown: stats[4],
        categoryBreakdown: stats[5],
        averageTurnaround: stats[6][0] || { avgTurnaround: 0, count: 0 }
      }
    });
  } catch (error) {
    console.error('Get test stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get today's workload
// @route   GET /api/tests/workload/today
// @access  Private
exports.getTodayWorkload = async (req, res) => {
  try {
    const today = moment().startOf('day');
    const tomorrow = moment().add(1, 'day').startOf('day');

    const workload = await Test.find({
      isActive: true,
      createdAt: { $gte: today.toDate(), $lt: tomorrow.toDate() }
    })
    .populate('patient', 'firstName lastName patientId')
    .sort({ priority: 1, createdAt: 1 });

    const summary = {
      total: workload.length,
      urgent: workload.filter(test => test.priority === 'urgent').length,
      high: workload.filter(test => test.priority === 'high').length,
      normal: workload.filter(test => test.priority === 'normal').length,
      low: workload.filter(test => test.priority === 'low').length,
      ordered: workload.filter(test => test.status === 'ordered').length,
      collected: workload.filter(test => test.status === 'collected').length,
      processing: workload.filter(test => test.status === 'processing').length,
      completed: workload.filter(test => test.status === 'completed').length
    };

    res.status(200).json({
      success: true,
      data: {
        tests: workload,
        summary
      }
    });
  } catch (error) {
    console.error('Get today workload error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Batch update tests
// @route   PUT /api/tests/batch/update
// @access  Private
exports.batchUpdateTests = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { testIds, updates } = req.body;

    const result = await Test.updateMany(
      { _id: { $in: testIds }, isActive: true },
      updates,
      { runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount
      },
      message: `${result.modifiedCount} tests updated successfully`
    });
  } catch (error) {
    console.error('Batch update tests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete test (soft delete)
// @route   DELETE /api/tests/:id
// @access  Private
exports.deleteTest = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test || !test.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }

    // Check if test has results
    const hasResults = await Result.findOne({ test: req.params.id, isActive: true });
    if (hasResults) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete test with existing results'
      });
    }

    test.isActive = false;
    await test.save();

    res.status(200).json({
      success: true,
      message: 'Test deleted successfully'
    });
  } catch (error) {
    console.error('Delete test error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};