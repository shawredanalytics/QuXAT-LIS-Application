const { body, param, query, validationResult } = require('express-validator');

// Common validation rules
const validationRules = {
  // User validation
  email: () => 
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),

  password: () => 
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),

  name: (field) => 
    body(field)
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage(`${field} must be between 2 and 50 characters`)
      .matches(/^[a-zA-Z\s'-]+$/)
      .withMessage(`${field} can only contain letters, spaces, hyphens, and apostrophes`),

  phone: () => 
    body('phone')
      .optional()
      .isMobilePhone()
      .withMessage('Please provide a valid phone number'),

  employeeId: () => 
    body('employeeId')
      .trim()
      .isLength({ min: 3, max: 20 })
      .withMessage('Employee ID must be between 3 and 20 characters')
      .matches(/^[A-Z0-9-]+$/)
      .withMessage('Employee ID can only contain uppercase letters, numbers, and hyphens'),

  role: () => 
    body('role')
      .isIn(['admin', 'lab_manager', 'technician', 'pathologist', 'receptionist', 'physician'])
      .withMessage('Invalid role specified'),

  department: () => 
    body('department')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Department must be between 2 and 50 characters'),

  // Patient validation
  dateOfBirth: () => 
    body('dateOfBirth')
      .isISO8601()
      .withMessage('Please provide a valid date of birth')
      .custom((value) => {
        const date = new Date(value);
        const now = new Date();
        const age = now.getFullYear() - date.getFullYear();
        if (age < 0 || age > 150) {
          throw new Error('Invalid date of birth');
        }
        return true;
      }),

  gender: () => 
    body('gender')
      .isIn(['male', 'female', 'other'])
      .withMessage('Gender must be male, female, or other'),

  address: () => 
    body('address.street')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Street address must not exceed 100 characters'),

  city: () => 
    body('address.city')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('City must not exceed 50 characters'),

  state: () => 
    body('address.state')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('State must not exceed 50 characters'),

  zipCode: () => 
    body('address.zipCode')
      .optional()
      .matches(/^\d{5}(-\d{4})?$/)
      .withMessage('Please provide a valid ZIP code'),

  // Test validation
  testType: () => 
    body('testType')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Test type must be between 2 and 100 characters'),

  category: () => 
    body('category')
      .isIn(['hematology', 'biochemistry', 'microbiology', 'immunology', 'molecular', 'pathology', 'other'])
      .withMessage('Invalid test category'),

  priority: () => 
    body('priority')
      .isIn(['routine', 'urgent', 'stat', 'critical'])
      .withMessage('Priority must be routine, urgent, stat, or critical'),

  sampleType: () => 
    body('sampleType')
      .isIn(['blood', 'urine', 'stool', 'sputum', 'csf', 'tissue', 'swab', 'other'])
      .withMessage('Invalid sample type'),

  // Result validation
  testValue: () => 
    body('testValues.*.value')
      .notEmpty()
      .withMessage('Test value is required'),

  testParameter: () => 
    body('testValues.*.parameter')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Test parameter must be between 1 and 100 characters'),

  // Common validations
  mongoId: (field) => 
    param(field)
      .isMongoId()
      .withMessage(`Invalid ${field} format`),

  status: (allowedStatuses) => 
    body('status')
      .isIn(allowedStatuses)
      .withMessage(`Status must be one of: ${allowedStatuses.join(', ')}`),

  pagination: () => [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('sort')
      .optional()
      .matches(/^[a-zA-Z_]+:(asc|desc)$/)
      .withMessage('Sort format should be field:direction (e.g., createdAt:desc)')
  ],

  search: () => 
    query('search')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Search term must be between 1 and 100 characters'),

  dateRange: () => [
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be a valid ISO 8601 date'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be a valid ISO 8601 date')
      .custom((endDate, { req }) => {
        if (req.query.startDate && endDate) {
          const start = new Date(req.query.startDate);
          const end = new Date(endDate);
          if (end <= start) {
            throw new Error('End date must be after start date');
          }
        }
        return true;
      })
  ]
};

// Validation middleware
const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(error => ({
          field: error.param,
          message: error.msg,
          value: error.value
        }))
      });
    }

    next();
  };
};

// Sanitization functions
const sanitize = {
  string: (str) => {
    if (typeof str !== 'string') return str;
    return str.trim().replace(/\s+/g, ' ');
  },

  email: (email) => {
    if (typeof email !== 'string') return email;
    return email.toLowerCase().trim();
  },

  phone: (phone) => {
    if (typeof phone !== 'string') return phone;
    return phone.replace(/\D/g, '');
  },

  name: (name) => {
    if (typeof name !== 'string') return name;
    return name.trim()
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  },

  alphanumeric: (str) => {
    if (typeof str !== 'string') return str;
    return str.replace(/[^a-zA-Z0-9]/g, '');
  },

  removeSpecialChars: (str) => {
    if (typeof str !== 'string') return str;
    return str.replace(/[^a-zA-Z0-9\s-_]/g, '');
  }
};

// Custom validation functions
const customValidators = {
  isValidAge: (dateOfBirth) => {
    const age = new Date().getFullYear() - new Date(dateOfBirth).getFullYear();
    return age >= 0 && age <= 150;
  },

  isValidTestValue: (value, dataType) => {
    switch (dataType) {
      case 'numeric':
        return !isNaN(parseFloat(value));
      case 'text':
        return typeof value === 'string' && value.trim().length > 0;
      case 'boolean':
        return typeof value === 'boolean' || ['true', 'false', '1', '0'].includes(value.toString().toLowerCase());
      default:
        return true;
    }
  },

  isValidRange: (value, min, max) => {
    const numValue = parseFloat(value);
    return !isNaN(numValue) && numValue >= min && numValue <= max;
  },

  isValidEnum: (value, allowedValues) => {
    return allowedValues.includes(value);
  },

  isValidDate: (date) => {
    const parsedDate = new Date(date);
    return parsedDate instanceof Date && !isNaN(parsedDate);
  },

  isValidTimeRange: (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return start < end;
  }
};

// Validation rule sets for different entities
const validationSets = {
  user: {
    create: [
      validationRules.name('firstName'),
      validationRules.name('lastName'),
      validationRules.email(),
      validationRules.password(),
      validationRules.role(),
      validationRules.employeeId(),
      validationRules.department(),
      validationRules.phone()
    ],
    update: [
      validationRules.name('firstName'),
      validationRules.name('lastName'),
      validationRules.role(),
      validationRules.department(),
      validationRules.phone()
    ],
    login: [
      validationRules.email(),
      body('password').notEmpty().withMessage('Password is required')
    ]
  },

  patient: {
    create: [
      validationRules.name('firstName'),
      validationRules.name('lastName'),
      validationRules.dateOfBirth(),
      validationRules.gender(),
      validationRules.phone(),
      validationRules.address(),
      validationRules.city(),
      validationRules.state(),
      validationRules.zipCode()
    ],
    update: [
      validationRules.name('firstName'),
      validationRules.name('lastName'),
      validationRules.phone(),
      validationRules.address(),
      validationRules.city(),
      validationRules.state(),
      validationRules.zipCode()
    ]
  },

  test: {
    create: [
      body('patient').isMongoId().withMessage('Valid patient ID is required'),
      validationRules.testType(),
      validationRules.category(),
      validationRules.priority(),
      validationRules.sampleType()
    ],
    update: [
      validationRules.priority(),
      validationRules.status(['ordered', 'collected', 'processing', 'completed', 'cancelled'])
    ]
  },

  result: {
    create: [
      body('test').isMongoId().withMessage('Valid test ID is required'),
      validationRules.testParameter(),
      validationRules.testValue()
    ],
    update: [
      validationRules.testParameter(),
      validationRules.testValue(),
      validationRules.status(['draft', 'pending_review', 'reviewed', 'approved', 'reported'])
    ]
  }
};

module.exports = {
  validationRules,
  validate,
  sanitize,
  customValidators,
  validationSets
};