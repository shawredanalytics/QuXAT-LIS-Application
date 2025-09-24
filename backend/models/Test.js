const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  testId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  testType: {
    type: String,
    required: [true, 'Test type is required'],
    enum: [
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
    ]
  },
  category: {
    type: String,
    required: true,
    enum: ['hematology', 'chemistry', 'microbiology', 'immunology', 'molecular', 'pathology']
  },
  priority: {
    type: String,
    enum: ['routine', 'urgent', 'stat', 'asap'],
    default: 'routine'
  },
  status: {
    type: String,
    enum: ['ordered', 'collected', 'processing', 'completed', 'cancelled', 'on_hold'],
    default: 'ordered'
  },
  sampleType: {
    type: String,
    required: [true, 'Sample type is required'],
    enum: ['blood', 'urine', 'stool', 'sputum', 'csf', 'synovial_fluid', 'tissue', 'swab', 'other']
  },
  sampleId: {
    type: String,
    unique: true,
    sparse: true
  },
  collectionDate: Date,
  collectionTime: String,
  collectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  processingDate: Date,
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  completedDate: Date,
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  orderedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  referringPhysician: {
    name: String,
    npi: String,
    phone: String
  },
  clinicalInfo: {
    diagnosis: String,
    symptoms: String,
    medications: String,
    relevantHistory: String
  },
  testParameters: [{
    parameter: String,
    method: String,
    expectedTurnaroundTime: Number // in hours
  }],
  specialInstructions: String,
  fastingRequired: {
    type: Boolean,
    default: false
  },
  fastingHours: Number,
  estimatedCompletionDate: Date,
  actualCompletionDate: Date,
  turnaroundTime: Number, // in hours
  cost: {
    type: Number,
    min: 0
  },
  insurance: {
    covered: Boolean,
    copay: Number,
    deductible: Number
  },
  qcStatus: {
    type: String,
    enum: ['pending', 'passed', 'failed', 'not_applicable'],
    default: 'pending'
  },
  comments: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Generate test ID and sample ID before saving
testSchema.pre('save', async function(next) {
  if (!this.testId) {
    const count = await mongoose.model('Test').countDocuments();
    this.testId = `TEST${String(count + 1).padStart(6, '0')}`;
  }
  
  if (!this.sampleId && this.sampleType) {
    const sampleCount = await mongoose.model('Test').countDocuments({ sampleType: this.sampleType });
    const prefix = this.sampleType.substring(0, 3).toUpperCase();
    this.sampleId = `${prefix}${String(sampleCount + 1).padStart(6, '0')}`;
  }
  
  next();
});

// Calculate turnaround time when status changes to completed
testSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'completed' && this.collectionDate) {
    const completedDate = this.completedDate || new Date();
    const collectionDate = new Date(this.collectionDate);
    this.turnaroundTime = Math.round((completedDate - collectionDate) / (1000 * 60 * 60)); // in hours
  }
  next();
});

// Index for search optimization
testSchema.index({ testId: 1 });
testSchema.index({ patient: 1 });
testSchema.index({ status: 1 });
testSchema.index({ category: 1 });
testSchema.index({ priority: 1 });
testSchema.index({ createdAt: -1 });
testSchema.index({ collectionDate: -1 });

module.exports = mongoose.model('Test', testSchema);