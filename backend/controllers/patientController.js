const { validationResult } = require('express-validator');
const Patient = require('../models/Patient');
const Test = require('../models/Test');
const Result = require('../models/Result');

// @desc    Get all patients
// @route   GET /api/patients
// @access  Private
const getPatients = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // Build query
    let query = {};
    
    if (req.query.search) {
      query.$or = [
        { firstName: { $regex: req.query.search, $options: 'i' } },
        { lastName: { $regex: req.query.search, $options: 'i' } },
        { patientId: { $regex: req.query.search, $options: 'i' } },
        { phone: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    if (req.query.gender) {
      query.gender = req.query.gender;
    }

    if (req.query.isActive !== undefined) {
      query.isActive = req.query.isActive === 'true';
    }

    const patients = await Patient.find(query)
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip(startIndex);

    const total = await Patient.countDocuments(query);

    // Pagination result
    const pagination = {};
    
    if (startIndex + limit < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.json({
      success: true,
      count: patients.length,
      total,
      pagination,
      data: patients
    });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single patient
// @route   GET /api/patients/:id
// @access  Private
const getPatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate('createdBy', 'firstName lastName')
      .populate('lastUpdatedBy', 'firstName lastName');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.json({
      success: true,
      data: patient
    });
  } catch (error) {
    console.error('Get patient error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create new patient
// @route   POST /api/patients
// @access  Private
const createPatient = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Add user who created the patient
    req.body.createdBy = req.user.id;

    const patient = await Patient.create(req.body);

    // Populate the created patient
    await patient.populate('createdBy', 'firstName lastName');

    res.status(201).json({
      success: true,
      message: 'Patient created successfully',
      data: patient
    });
  } catch (error) {
    console.error('Create patient error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Patient with this ID already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update patient
// @route   PUT /api/patients/:id
// @access  Private
const updatePatient = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Add user who updated the patient
    req.body.lastUpdatedBy = req.user.id;

    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('createdBy lastUpdatedBy', 'firstName lastName');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.json({
      success: true,
      message: 'Patient updated successfully',
      data: patient
    });
  } catch (error) {
    console.error('Update patient error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete patient (soft delete)
// @route   DELETE /api/patients/:id
// @access  Private
const deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Check if patient has active tests
    const activeTests = await Test.countDocuments({
      patient: req.params.id,
      status: { $in: ['ordered', 'collected', 'processing'] }
    });

    if (activeTests > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete patient with active tests'
      });
    }

    // Soft delete
    patient.isActive = false;
    patient.lastUpdatedBy = req.user.id;
    await patient.save();

    res.json({
      success: true,
      message: 'Patient deleted successfully'
    });
  } catch (error) {
    console.error('Delete patient error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get patient's tests
// @route   GET /api/patients/:id/tests
// @access  Private
const getPatientTests = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // Build query
    let query = { patient: req.params.id };
    
    if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.category) {
      query.category = req.query.category;
    }

    const tests = await Test.find(query)
      .populate('orderedBy collectedBy processedBy completedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip(startIndex);

    const total = await Test.countDocuments(query);

    res.json({
      success: true,
      count: tests.length,
      total,
      data: tests
    });
  } catch (error) {
    console.error('Get patient tests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get patient's results
// @route   GET /api/patients/:id/results
// @access  Private
const getPatientResults = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // Build query
    let query = { patient: req.params.id };
    
    if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.overallStatus) {
      query.overallStatus = req.query.overallStatus;
    }

    const results = await Result.find(query)
      .populate('test', 'testId testType category')
      .populate('performedBy reviewedBy approvedBy', 'firstName lastName')
      .sort({ performedDate: -1 })
      .limit(limit * 1)
      .skip(startIndex);

    const total = await Result.countDocuments(query);

    res.json({
      success: true,
      count: results.length,
      total,
      data: results
    });
  } catch (error) {
    console.error('Get patient results error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Advanced patient search
// @route   POST /api/patients/search
// @access  Private
const searchPatients = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { criteria } = req.body;
    let query = {};

    // Build search query
    if (criteria.firstName) {
      query.firstName = { $regex: criteria.firstName, $options: 'i' };
    }

    if (criteria.lastName) {
      query.lastName = { $regex: criteria.lastName, $options: 'i' };
    }

    if (criteria.patientId) {
      query.patientId = { $regex: criteria.patientId, $options: 'i' };
    }

    if (criteria.phone) {
      query.phone = { $regex: criteria.phone, $options: 'i' };
    }

    if (criteria.email) {
      query.email = criteria.email;
    }

    if (criteria.dateOfBirth) {
      query.dateOfBirth = new Date(criteria.dateOfBirth);
    }

    if (criteria.ageRange) {
      const today = new Date();
      if (criteria.ageRange.min !== undefined) {
        const maxBirthDate = new Date(today.getFullYear() - criteria.ageRange.min, today.getMonth(), today.getDate());
        query.dateOfBirth = { ...query.dateOfBirth, $lte: maxBirthDate };
      }
      if (criteria.ageRange.max !== undefined) {
        const minBirthDate = new Date(today.getFullYear() - criteria.ageRange.max - 1, today.getMonth(), today.getDate());
        query.dateOfBirth = { ...query.dateOfBirth, $gte: minBirthDate };
      }
    }

    const patients = await Patient.find(query)
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(50); // Limit search results

    res.json({
      success: true,
      count: patients.length,
      data: patients
    });
  } catch (error) {
    console.error('Search patients error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getPatients,
  getPatient,
  createPatient,
  updatePatient,
  deletePatient,
  getPatientTests,
  getPatientResults,
  searchPatients
};