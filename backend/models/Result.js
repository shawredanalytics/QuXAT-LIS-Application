const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  resultId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  test: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  testValues: [{
    parameter: {
      type: String,
      required: true
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    unit: String,
    referenceRange: {
      min: mongoose.Schema.Types.Mixed,
      max: mongoose.Schema.Types.Mixed,
      text: String
    },
    flag: {
      type: String,
      enum: ['normal', 'high', 'low', 'critical_high', 'critical_low', 'abnormal'],
      default: 'normal'
    },
    method: String,
    instrument: String,
    dilution: String,
    comments: String
  }],
  overallStatus: {
    type: String,
    enum: ['normal', 'abnormal', 'critical', 'inconclusive'],
    default: 'normal'
  },
  interpretation: String,
  clinicalSignificance: String,
  recommendations: String,
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  performedDate: {
    type: Date,
    default: Date.now
  },
  reviewedDate: Date,
  approvedDate: Date,
  reportedDate: Date,
  status: {
    type: String,
    enum: ['draft', 'pending_review', 'reviewed', 'approved', 'reported', 'amended'],
    default: 'draft'
  },
  qcResults: [{
    controlLevel: String,
    expectedValue: mongoose.Schema.Types.Mixed,
    observedValue: mongoose.Schema.Types.Mixed,
    status: {
      type: String,
      enum: ['passed', 'failed', 'warning'],
      default: 'passed'
    },
    comments: String
  }],
  instrumentData: {
    instrumentId: String,
    runNumber: String,
    calibrationDate: Date,
    maintenanceDate: Date,
    temperature: Number,
    humidity: Number
  },
  technicalComments: String,
  criticalValues: [{
    parameter: String,
    value: mongoose.Schema.Types.Mixed,
    notifiedTo: String,
    notificationDate: Date,
    notificationMethod: {
      type: String,
      enum: ['phone', 'email', 'fax', 'in_person']
    }
  }],
  amendments: [{
    amendmentDate: Date,
    amendedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    originalValue: String,
    newValue: String,
    parameter: String
  }],
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    uploadDate: Date,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  reportFormat: {
    type: String,
    enum: ['standard', 'detailed', 'summary'],
    default: 'standard'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Generate result ID before saving
resultSchema.pre('save', async function(next) {
  if (!this.resultId) {
    const count = await mongoose.model('Result').countDocuments();
    this.resultId = `RES${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Update overall status based on test values
resultSchema.pre('save', function(next) {
  if (this.testValues && this.testValues.length > 0) {
    const flags = this.testValues.map(tv => tv.flag);
    
    if (flags.includes('critical_high') || flags.includes('critical_low')) {
      this.overallStatus = 'critical';
    } else if (flags.includes('high') || flags.includes('low') || flags.includes('abnormal')) {
      this.overallStatus = 'abnormal';
    } else {
      this.overallStatus = 'normal';
    }
  }
  next();
});

// Set reported date when status changes to reported
resultSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'reported' && !this.reportedDate) {
    this.reportedDate = new Date();
  }
  next();
});

// Index for search optimization
resultSchema.index({ resultId: 1 });
resultSchema.index({ test: 1 });
resultSchema.index({ patient: 1 });
resultSchema.index({ status: 1 });
resultSchema.index({ overallStatus: 1 });
resultSchema.index({ performedDate: -1 });
resultSchema.index({ reportedDate: -1 });

module.exports = mongoose.model('Result', resultSchema);