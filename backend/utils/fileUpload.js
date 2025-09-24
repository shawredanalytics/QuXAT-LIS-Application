const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Ensure upload directories exist
const createUploadDirs = () => {
  const dirs = [
    'uploads',
    'uploads/profiles',
    'uploads/attachments',
    'uploads/reports',
    'uploads/temp'
  ];

  dirs.forEach(dir => {
    const fullPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  });
};

// Initialize upload directories
createUploadDirs();

// Storage configuration for profile images
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads', 'profiles'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `profile-${uniqueSuffix}${ext}`);
  }
});

// Storage configuration for attachments
const attachmentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads', 'attachments'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname);
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${Date.now()}-${uniqueSuffix}-${sanitizedName}`);
  }
});

// Storage configuration for reports
const reportStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads', 'reports'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `report-${Date.now()}-${uniqueSuffix}${ext}`);
  }
});

// File filter for images
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, JPG, PNG, GIF, WebP) are allowed'));
  }
};

// File filter for documents
const documentFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx|xls|xlsx|txt|csv/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  
  if (extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only document files (PDF, DOC, DOCX, XLS, XLSX, TXT, CSV) are allowed'));
  }
};

// File filter for all types (with size restrictions)
const generalFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|pdf|doc|docx|xls|xlsx|txt|csv/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  
  if (extname) {
    return cb(null, true);
  } else {
    cb(new Error('File type not allowed'));
  }
};

// Multer configurations
const profileUpload = multer({
  storage: profileStorage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
    files: 1
  },
  fileFilter: imageFilter
});

const attachmentUpload = multer({
  storage: attachmentStorage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
    files: 5
  },
  fileFilter: generalFilter
});

const reportUpload = multer({
  storage: reportStorage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 20 * 1024 * 1024, // 20MB default
    files: 1
  },
  fileFilter: documentFilter
});

// Memory storage for temporary processing
const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024,
    files: 1
  }
});

// Utility functions
const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

const getFileInfo = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      return {
        exists: true,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        extension: path.extname(filePath),
        name: path.basename(filePath)
      };
    }
    return { exists: false };
  } catch (error) {
    console.error('Error getting file info:', error);
    return { exists: false, error: error.message };
  }
};

const moveFile = (sourcePath, destinationPath) => {
  try {
    // Ensure destination directory exists
    const destDir = path.dirname(destinationPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    fs.renameSync(sourcePath, destinationPath);
    return true;
  } catch (error) {
    console.error('Error moving file:', error);
    return false;
  }
};

const copyFile = (sourcePath, destinationPath) => {
  try {
    // Ensure destination directory exists
    const destDir = path.dirname(destinationPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    fs.copyFileSync(sourcePath, destinationPath);
    return true;
  } catch (error) {
    console.error('Error copying file:', error);
    return false;
  }
};

const generateUniqueFilename = (originalName) => {
  const uniqueSuffix = crypto.randomBytes(16).toString('hex');
  const ext = path.extname(originalName);
  const name = path.basename(originalName, ext);
  const sanitizedName = name.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `${Date.now()}-${uniqueSuffix}-${sanitizedName}${ext}`;
};

const validateFileType = (filename, allowedTypes) => {
  const ext = path.extname(filename).toLowerCase();
  return allowedTypes.includes(ext);
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Clean up old files (for maintenance)
const cleanupOldFiles = (directory, maxAgeInDays = 30) => {
  try {
    const dirPath = path.join(__dirname, '..', 'uploads', directory);
    if (!fs.existsSync(dirPath)) return;

    const files = fs.readdirSync(dirPath);
    const maxAge = maxAgeInDays * 24 * 60 * 60 * 1000; // Convert to milliseconds
    const now = Date.now();

    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      
      if (now - stats.mtime.getTime() > maxAge) {
        fs.unlinkSync(filePath);
        console.log(`Deleted old file: ${file}`);
      }
    });
  } catch (error) {
    console.error('Error cleaning up old files:', error);
  }
};

// Error handling middleware
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          message: `File too large. Maximum size is ${formatFileSize(parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024)}`
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          message: 'Too many files uploaded'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          message: 'Unexpected file field'
        });
      default:
        return res.status(400).json({
          success: false,
          message: 'File upload error'
        });
    }
  }

  if (error.message.includes('Only')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  next(error);
};

module.exports = {
  profileUpload,
  attachmentUpload,
  reportUpload,
  memoryUpload,
  deleteFile,
  getFileInfo,
  moveFile,
  copyFile,
  generateUniqueFilename,
  validateFileType,
  formatFileSize,
  cleanupOldFiles,
  handleUploadError,
  createUploadDirs
};