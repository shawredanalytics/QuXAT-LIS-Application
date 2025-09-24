const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let metaStr = '';
    if (Object.keys(meta).length > 0) {
      metaStr = '\n' + JSON.stringify(meta, null, 2);
    }
    return `${timestamp} [${level}]: ${message}${metaStr}`;
  })
);

// Custom format for file output
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: fileFormat,
  defaultMeta: { service: 'lis-backend' },
  transports: [
    // Error log file
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: fileFormat
    }),

    // Combined log file
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: fileFormat
    }),

    // Access log file
    new winston.transports.File({
      filename: path.join(logsDir, 'access.log'),
      level: 'http',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: fileFormat
    })
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

// Custom logging methods for different scenarios
const customLogger = {
  // Authentication logs
  auth: {
    login: (userId, email, ip) => {
      logger.info('User login', {
        type: 'auth',
        action: 'login',
        userId,
        email,
        ip,
        timestamp: new Date().toISOString()
      });
    },

    logout: (userId, email, ip) => {
      logger.info('User logout', {
        type: 'auth',
        action: 'logout',
        userId,
        email,
        ip,
        timestamp: new Date().toISOString()
      });
    },

    loginFailed: (email, ip, reason) => {
      logger.warn('Login failed', {
        type: 'auth',
        action: 'login_failed',
        email,
        ip,
        reason,
        timestamp: new Date().toISOString()
      });
    },

    passwordReset: (userId, email, ip) => {
      logger.info('Password reset requested', {
        type: 'auth',
        action: 'password_reset',
        userId,
        email,
        ip,
        timestamp: new Date().toISOString()
      });
    }
  },

  // Database operation logs
  db: {
    create: (collection, documentId, userId) => {
      logger.info('Document created', {
        type: 'database',
        action: 'create',
        collection,
        documentId,
        userId,
        timestamp: new Date().toISOString()
      });
    },

    update: (collection, documentId, userId, changes) => {
      logger.info('Document updated', {
        type: 'database',
        action: 'update',
        collection,
        documentId,
        userId,
        changes,
        timestamp: new Date().toISOString()
      });
    },

    delete: (collection, documentId, userId) => {
      logger.warn('Document deleted', {
        type: 'database',
        action: 'delete',
        collection,
        documentId,
        userId,
        timestamp: new Date().toISOString()
      });
    },

    error: (operation, error, context) => {
      logger.error('Database operation failed', {
        type: 'database',
        action: 'error',
        operation,
        error: error.message,
        stack: error.stack,
        context,
        timestamp: new Date().toISOString()
      });
    }
  },

  // API request logs
  api: {
    request: (method, url, userId, ip, userAgent) => {
      logger.http('API request', {
        type: 'api',
        action: 'request',
        method,
        url,
        userId,
        ip,
        userAgent,
        timestamp: new Date().toISOString()
      });
    },

    response: (method, url, statusCode, responseTime, userId) => {
      logger.http('API response', {
        type: 'api',
        action: 'response',
        method,
        url,
        statusCode,
        responseTime,
        userId,
        timestamp: new Date().toISOString()
      });
    },

    error: (method, url, error, userId, ip) => {
      logger.error('API error', {
        type: 'api',
        action: 'error',
        method,
        url,
        error: error.message,
        stack: error.stack,
        userId,
        ip,
        timestamp: new Date().toISOString()
      });
    }
  },

  // Security logs
  security: {
    suspiciousActivity: (type, details, userId, ip) => {
      logger.warn('Suspicious activity detected', {
        type: 'security',
        action: 'suspicious_activity',
        activityType: type,
        details,
        userId,
        ip,
        timestamp: new Date().toISOString()
      });
    },

    accessDenied: (resource, userId, ip, reason) => {
      logger.warn('Access denied', {
        type: 'security',
        action: 'access_denied',
        resource,
        userId,
        ip,
        reason,
        timestamp: new Date().toISOString()
      });
    },

    rateLimitExceeded: (ip, endpoint, attempts) => {
      logger.warn('Rate limit exceeded', {
        type: 'security',
        action: 'rate_limit_exceeded',
        ip,
        endpoint,
        attempts,
        timestamp: new Date().toISOString()
      });
    }
  },

  // Business logic logs
  business: {
    testOrdered: (testId, patientId, userId) => {
      logger.info('Test ordered', {
        type: 'business',
        action: 'test_ordered',
        testId,
        patientId,
        userId,
        timestamp: new Date().toISOString()
      });
    },

    resultReported: (resultId, testId, patientId, userId) => {
      logger.info('Result reported', {
        type: 'business',
        action: 'result_reported',
        resultId,
        testId,
        patientId,
        userId,
        timestamp: new Date().toISOString()
      });
    },

    criticalValue: (resultId, testId, patientId, values) => {
      logger.warn('Critical value detected', {
        type: 'business',
        action: 'critical_value',
        resultId,
        testId,
        patientId,
        criticalValues: values,
        timestamp: new Date().toISOString()
      });
    },

    patientRegistered: (patientId, userId) => {
      logger.info('Patient registered', {
        type: 'business',
        action: 'patient_registered',
        patientId,
        userId,
        timestamp: new Date().toISOString()
      });
    }
  },

  // System logs
  system: {
    startup: (port, environment) => {
      logger.info('Application started', {
        type: 'system',
        action: 'startup',
        port,
        environment,
        timestamp: new Date().toISOString()
      });
    },

    shutdown: (reason) => {
      logger.info('Application shutdown', {
        type: 'system',
        action: 'shutdown',
        reason,
        timestamp: new Date().toISOString()
      });
    },

    dbConnected: (database) => {
      logger.info('Database connected', {
        type: 'system',
        action: 'db_connected',
        database,
        timestamp: new Date().toISOString()
      });
    },

    dbDisconnected: (database, reason) => {
      logger.warn('Database disconnected', {
        type: 'system',
        action: 'db_disconnected',
        database,
        reason,
        timestamp: new Date().toISOString()
      });
    },

    emailSent: (to, subject, type) => {
      logger.info('Email sent', {
        type: 'system',
        action: 'email_sent',
        to,
        subject,
        emailType: type,
        timestamp: new Date().toISOString()
      });
    },

    emailFailed: (to, subject, error) => {
      logger.error('Email failed', {
        type: 'system',
        action: 'email_failed',
        to,
        subject,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
};

// Middleware for request logging
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log request
  customLogger.api.request(
    req.method,
    req.originalUrl,
    req.user?.id,
    req.ip,
    req.get('User-Agent')
  );

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(...args) {
    const responseTime = Date.now() - start;
    customLogger.api.response(
      req.method,
      req.originalUrl,
      res.statusCode,
      responseTime,
      req.user?.id
    );
    originalEnd.apply(this, args);
  };

  next();
};

// Error logging middleware
const errorLogger = (error, req, res, next) => {
  customLogger.api.error(
    req.method,
    req.originalUrl,
    error,
    req.user?.id,
    req.ip
  );
  next(error);
};

// Log cleanup function
const cleanupLogs = (daysToKeep = 30) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  const logFiles = fs.readdirSync(logsDir);
  
  logFiles.forEach(file => {
    const filePath = path.join(logsDir, file);
    const stats = fs.statSync(filePath);
    
    if (stats.mtime < cutoffDate) {
      fs.unlinkSync(filePath);
      logger.info(`Deleted old log file: ${file}`);
    }
  });
};

module.exports = {
  logger,
  ...customLogger,
  requestLogger,
  errorLogger,
  cleanupLogs
};