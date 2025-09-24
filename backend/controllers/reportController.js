const { validationResult } = require('express-validator');
const Test = require('../models/Test');
const Result = require('../models/Result');
const Patient = require('../models/Patient');
const User = require('../models/User');
const moment = require('moment');

// @desc    Get dashboard analytics
// @route   GET /api/reports/analytics/dashboard
// @access  Private
exports.getDashboardAnalytics = async (req, res) => {
  try {
    const today = moment().startOf('day');
    const yesterday = moment().subtract(1, 'day').startOf('day');
    const thisWeek = moment().startOf('week');
    const lastWeek = moment().subtract(1, 'week').startOf('week');
    const thisMonth = moment().startOf('month');
    const lastMonth = moment().subtract(1, 'month').startOf('month');

    const analytics = await Promise.all([
      // Today vs Yesterday
      Test.countDocuments({ isActive: true, createdAt: { $gte: today.toDate() } }),
      Test.countDocuments({ 
        isActive: true, 
        createdAt: { $gte: yesterday.toDate(), $lt: today.toDate() } 
      }),
      
      // This week vs last week
      Test.countDocuments({ isActive: true, createdAt: { $gte: thisWeek.toDate() } }),
      Test.countDocuments({ 
        isActive: true, 
        createdAt: { $gte: lastWeek.toDate(), $lt: thisWeek.toDate() } 
      }),
      
      // This month vs last month
      Test.countDocuments({ isActive: true, createdAt: { $gte: thisMonth.toDate() } }),
      Test.countDocuments({ 
        isActive: true, 
        createdAt: { $gte: lastMonth.toDate(), $lt: thisMonth.toDate() } 
      }),
      
      // Results statistics
      Result.countDocuments({ isActive: true, createdAt: { $gte: today.toDate() } }),
      Result.countDocuments({ isActive: true, status: 'draft' }),
      Result.countDocuments({ isActive: true, 'testValues.flags': 'critical' }),
      
      // Patient statistics
      Patient.countDocuments({ isActive: true, createdAt: { $gte: today.toDate() } }),
      Patient.countDocuments({ isActive: true }),
      
      // Test completion rate
      Test.aggregate([
        { $match: { isActive: true, createdAt: { $gte: thisMonth.toDate() } } },
        { 
          $group: { 
            _id: null, 
            total: { $sum: 1 },
            completed: { 
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } 
            }
          } 
        }
      ])
    ]);

    const calculatePercentageChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous * 100).toFixed(1);
    };

    res.status(200).json({
      success: true,
      data: {
        tests: {
          today: analytics[0],
          todayChange: calculatePercentageChange(analytics[0], analytics[1]),
          week: analytics[2],
          weekChange: calculatePercentageChange(analytics[2], analytics[3]),
          month: analytics[4],
          monthChange: calculatePercentageChange(analytics[4], analytics[5])
        },
        results: {
          today: analytics[6],
          pendingReview: analytics[7],
          criticalValues: analytics[8]
        },
        patients: {
          today: analytics[9],
          total: analytics[10]
        },
        completionRate: analytics[11][0] ? 
          ((analytics[11][0].completed / analytics[11][0].total) * 100).toFixed(1) : 0
      }
    });
  } catch (error) {
    console.error('Get dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get test volume report
// @route   GET /api/reports/test-volume
// @access  Private
exports.getTestVolumeReport = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { dateFrom, dateTo, groupBy = 'day' } = req.query;
    const startDate = moment(dateFrom).startOf('day');
    const endDate = moment(dateTo).endOf('day');

    let groupFormat;
    switch (groupBy) {
      case 'hour':
        groupFormat = '%Y-%m-%d %H:00';
        break;
      case 'day':
        groupFormat = '%Y-%m-%d';
        break;
      case 'week':
        groupFormat = '%Y-W%U';
        break;
      case 'month':
        groupFormat = '%Y-%m';
        break;
      default:
        groupFormat = '%Y-%m-%d';
    }

    const volumeData = await Test.aggregate([
      {
        $match: {
          isActive: true,
          createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: groupFormat, date: '$createdAt' } },
            category: '$category'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          categories: {
            $push: {
              category: '$_id.category',
              count: '$count'
            }
          },
          total: { $sum: '$count' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: volumeData
    });
  } catch (error) {
    console.error('Get test volume report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get turnaround time report
// @route   GET /api/reports/turnaround-time
// @access  Private
exports.getTurnaroundTimeReport = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { dateFrom, dateTo, category } = req.query;
    const filter = {
      isActive: true,
      status: 'completed',
      turnaroundTime: { $exists: true, $ne: null }
    };

    if (dateFrom || dateTo) {
      filter.actualCompletionDate = {};
      if (dateFrom) filter.actualCompletionDate.$gte = new Date(dateFrom);
      if (dateTo) filter.actualCompletionDate.$lte = new Date(dateTo);
    }

    if (category) {
      filter.category = category;
    }

    const turnaroundData = await Test.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$category',
          avgTurnaround: { $avg: '$turnaroundTime' },
          minTurnaround: { $min: '$turnaroundTime' },
          maxTurnaround: { $max: '$turnaroundTime' },
          count: { $sum: 1 },
          within24h: {
            $sum: { $cond: [{ $lte: ['$turnaroundTime', 24] }, 1, 0] }
          },
          within48h: {
            $sum: { $cond: [{ $lte: ['$turnaroundTime', 48] }, 1, 0] }
          }
        }
      },
      {
        $addFields: {
          within24hPercent: { 
            $multiply: [{ $divide: ['$within24h', '$count'] }, 100] 
          },
          within48hPercent: { 
            $multiply: [{ $divide: ['$within48h', '$count'] }, 100] 
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: turnaroundData
    });
  } catch (error) {
    console.error('Get turnaround time report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get quality control report
// @route   GET /api/reports/quality-control
// @access  Private
exports.getQualityControlReport = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { dateFrom, dateTo } = req.query;
    const filter = { isActive: true };

    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    const qcData = await Promise.all([
      // Test QC status
      Test.aggregate([
        { $match: filter },
        {
          $group: {
            _id: '$qcStatus',
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Result QC status
      Result.aggregate([
        { $match: filter },
        {
          $group: {
            _id: '$qcResults.status',
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Critical values tracking
      Result.aggregate([
        { $match: { ...filter, 'testValues.flags': 'critical' } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            count: { $sum: 1 },
            notified: {
              $sum: { $cond: ['$criticalValueNotified', 1, 0] }
            }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      
      // Amendment tracking
      Result.aggregate([
        { $match: filter },
        { $unwind: '$amendments' },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$amendments.amendedDate' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        testQcStatus: qcData[0],
        resultQcStatus: qcData[1],
        criticalValues: qcData[2],
        amendments: qcData[3]
      }
    });
  } catch (error) {
    console.error('Get quality control report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get critical values report
// @route   GET /api/reports/critical-values
// @access  Private
exports.getCriticalValuesReport = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { dateFrom, dateTo } = req.query;
    const filter = {
      isActive: true,
      'testValues.flags': 'critical'
    };

    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    const criticalData = await Result.find(filter)
      .populate({
        path: 'test',
        populate: {
          path: 'patient',
          select: 'firstName lastName patientId dateOfBirth phone'
        }
      })
      .populate('performedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    const summary = await Result.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          notified: {
            $sum: { $cond: ['$criticalValueNotified', 1, 0] }
          },
          avgNotificationTime: {
            $avg: {
              $subtract: ['$criticalValueNotificationDate', '$createdAt']
            }
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        results: criticalData,
        summary: summary[0] || { total: 0, notified: 0, avgNotificationTime: 0 }
      }
    });
  } catch (error) {
    console.error('Get critical values report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get patient summary report
// @route   GET /api/reports/patient-summary/:patientId
// @access  Private
exports.getPatientSummaryReport = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { dateFrom, dateTo } = req.query;

    const patient = await Patient.findById(patientId);
    if (!patient || !patient.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    const filter = { patient: patientId, isActive: true };
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    const [tests, results] = await Promise.all([
      Test.find(filter)
        .populate('orderedBy', 'firstName lastName')
        .sort({ createdAt: -1 }),
      
      Result.find(filter)
        .populate('test', 'testType category priority')
        .sort({ createdAt: -1 })
    ]);

    const summary = {
      totalTests: tests.length,
      completedTests: tests.filter(t => t.status === 'completed').length,
      pendingTests: tests.filter(t => !['completed', 'cancelled'].includes(t.status)).length,
      totalResults: results.length,
      criticalResults: results.filter(r => 
        r.testValues.some(v => v.flags && v.flags.includes('critical'))
      ).length
    };

    res.status(200).json({
      success: true,
      data: {
        patient,
        tests,
        results,
        summary
      }
    });
  } catch (error) {
    console.error('Get patient summary report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get staff workload report
// @route   GET /api/reports/staff-workload
// @access  Private
exports.getStaffWorkloadReport = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { dateFrom, dateTo, department } = req.query;
    const dateFilter = {};
    if (dateFrom) dateFilter.$gte = new Date(dateFrom);
    if (dateTo) dateFilter.$lte = new Date(dateTo);

    const userFilter = { isActive: true };
    if (department) userFilter.department = department;

    const workloadData = await Promise.all([
      // Tests ordered by staff
      Test.aggregate([
        {
          $match: {
            isActive: true,
            ...(Object.keys(dateFilter).length && { createdAt: dateFilter })
          }
        },
        {
          $group: {
            _id: '$orderedBy',
            testsOrdered: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        {
          $match: userFilter
        }
      ]),
      
      // Tests processed by staff
      Test.aggregate([
        {
          $match: {
            isActive: true,
            processedBy: { $exists: true },
            ...(Object.keys(dateFilter).length && { processingDate: dateFilter })
          }
        },
        {
          $group: {
            _id: '$processedBy',
            testsProcessed: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        {
          $match: userFilter
        }
      ]),
      
      // Results reviewed by staff
      Result.aggregate([
        {
          $match: {
            isActive: true,
            reviewedBy: { $exists: true },
            ...(Object.keys(dateFilter).length && { reviewedDate: dateFilter })
          }
        },
        {
          $group: {
            _id: '$reviewedBy',
            resultsReviewed: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        {
          $match: userFilter
        }
      ])
    ]);

    // Combine all workload data
    const staffWorkload = {};
    
    workloadData[0].forEach(item => {
      const userId = item._id.toString();
      if (!staffWorkload[userId]) {
        staffWorkload[userId] = {
          user: item.user,
          testsOrdered: 0,
          testsProcessed: 0,
          resultsReviewed: 0
        };
      }
      staffWorkload[userId].testsOrdered = item.testsOrdered;
    });

    workloadData[1].forEach(item => {
      const userId = item._id.toString();
      if (!staffWorkload[userId]) {
        staffWorkload[userId] = {
          user: item.user,
          testsOrdered: 0,
          testsProcessed: 0,
          resultsReviewed: 0
        };
      }
      staffWorkload[userId].testsProcessed = item.testsProcessed;
    });

    workloadData[2].forEach(item => {
      const userId = item._id.toString();
      if (!staffWorkload[userId]) {
        staffWorkload[userId] = {
          user: item.user,
          testsOrdered: 0,
          testsProcessed: 0,
          resultsReviewed: 0
        };
      }
      staffWorkload[userId].resultsReviewed = item.resultsReviewed;
    });

    res.status(200).json({
      success: true,
      data: Object.values(staffWorkload)
    });
  } catch (error) {
    console.error('Get staff workload report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Generate custom report
// @route   POST /api/reports/custom/generate
// @access  Private
exports.generateCustomReport = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { reportType, filters, fields, groupBy, sortBy } = req.body;

    let Model;
    switch (reportType) {
      case 'tests':
        Model = Test;
        break;
      case 'results':
        Model = Result;
        break;
      case 'patients':
        Model = Patient;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid report type'
        });
    }

    // Build aggregation pipeline
    const pipeline = [];

    // Match stage
    const matchStage = { isActive: true };
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined) {
          matchStage[key] = filters[key];
        }
      });
    }
    pipeline.push({ $match: matchStage });

    // Group stage
    if (groupBy) {
      const groupStage = { _id: `$${groupBy}` };
      fields.forEach(field => {
        if (field.aggregation === 'count') {
          groupStage[field.name] = { $sum: 1 };
        } else if (field.aggregation === 'sum') {
          groupStage[field.name] = { $sum: `$${field.field}` };
        } else if (field.aggregation === 'avg') {
          groupStage[field.name] = { $avg: `$${field.field}` };
        }
      });
      pipeline.push({ $group: groupStage });
    }

    // Sort stage
    if (sortBy) {
      const sortStage = {};
      sortStage[sortBy.field] = sortBy.direction === 'desc' ? -1 : 1;
      pipeline.push({ $sort: sortStage });
    }

    const data = await Model.aggregate(pipeline);

    res.status(200).json({
      success: true,
      data,
      reportConfig: req.body
    });
  } catch (error) {
    console.error('Generate custom report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Export report
// @route   GET /api/reports/export/:reportType
// @access  Private
exports.exportReport = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { reportType } = req.params;
    const { format, ...filters } = req.query;

    // This is a placeholder for report export functionality
    // In a real implementation, you would generate CSV, Excel, or PDF files
    
    res.status(200).json({
      success: true,
      message: `${reportType} report export in ${format} format initiated`,
      downloadUrl: `/downloads/reports/${reportType}_${Date.now()}.${format}`
    });
  } catch (error) {
    console.error('Export report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};