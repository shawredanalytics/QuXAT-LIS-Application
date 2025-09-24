# QuXAT Laboratory Information System - Backend API

A comprehensive Laboratory Information System (LIS) backend built with Node.js, Express, and MongoDB. This system manages patient data, laboratory tests, results, and reporting for healthcare facilities.

## Features

- **User Management**: Role-based authentication and authorization
- **Patient Management**: Complete patient registration and data management
- **Test Management**: Laboratory test ordering, tracking, and processing
- **Result Management**: Test result entry, review, approval, and reporting
- **Reporting & Analytics**: Comprehensive reporting and dashboard analytics
- **Security**: JWT authentication, rate limiting, data validation, and sanitization
- **File Management**: Profile images and document attachments
- **Email Notifications**: Automated notifications for critical values and reports
- **Audit Logging**: Comprehensive logging for compliance and monitoring

## Technology Stack

- **Runtime**: Node.js (>=16.0.0)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express Validator
- **Security**: Helmet, CORS, Rate Limiting, XSS Protection
- **File Upload**: Multer
- **Email**: Nodemailer
- **Logging**: Winston
- **Testing**: Jest & Supertest

## Prerequisites

- Node.js (version 16.0.0 or higher)
- MongoDB (version 4.4 or higher)
- npm (version 8.0.0 or higher)

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/quxat/lis-backend.git
   cd lis-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   
   Create a `.env` file in the root directory with the following variables:
   ```env
   # Server Configuration
   NODE_ENV=development
   PORT=5000
   FRONTEND_URL=http://localhost:3000
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/quxat_lis

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=7d

   # Email Configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_FROM=noreply@quxat.com

   # File Upload Configuration
   MAX_FILE_SIZE=10485760

   # Laboratory Information
   LAB_NAME=QuXAT Laboratory
   LAB_ADDRESS=123 Medical Center Drive
   LAB_PHONE=+1-555-0123
   LAB_EMAIL=lab@quxat.com
   LAB_MANAGER_EMAIL=manager@quxat.com

   # Security Configuration
   BCRYPT_SALT_ROUNDS=12
   RATE_LIMIT_WINDOW=900000
   RATE_LIMIT_MAX_REQUESTS=100

   # Logging Configuration
   LOG_LEVEL=info
   ```

4. **Start the application**
   
   **Development mode:**
   ```bash
   npm run dev
   ```
   
   **Production mode:**
   ```bash
   npm start
   ```

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "role": "technician",
  "employeeId": "EMP001",
  "department": "Hematology",
  "phone": "+1234567890"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <jwt_token>
```

### Patient Endpoints

#### Create Patient
```http
POST /api/patients
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith",
  "dateOfBirth": "1990-05-15",
  "gender": "female",
  "phone": "+1234567890",
  "email": "jane.smith@example.com",
  "address": {
    "street": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "zipCode": "12345"
  }
}
```

#### Get All Patients
```http
GET /api/patients?page=1&limit=10&search=jane
Authorization: Bearer <jwt_token>
```

#### Get Patient by ID
```http
GET /api/patients/:id
Authorization: Bearer <jwt_token>
```

### Test Endpoints

#### Create Test
```http
POST /api/tests
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "patient": "patient_id_here",
  "testType": "Complete Blood Count",
  "category": "hematology",
  "priority": "routine",
  "sampleType": "blood",
  "clinicalHistory": "Routine checkup",
  "referringPhysician": {
    "name": "Dr. Johnson",
    "email": "dr.johnson@hospital.com"
  }
}
```

#### Get All Tests
```http
GET /api/tests?status=ordered&category=hematology
Authorization: Bearer <jwt_token>
```

### Result Endpoints

#### Create Result
```http
POST /api/results
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "test": "test_id_here",
  "testValues": [
    {
      "parameter": "Hemoglobin",
      "value": "14.5",
      "unit": "g/dL",
      "referenceRange": "12.0-15.5",
      "flags": ["normal"]
    }
  ],
  "interpretation": "Normal results",
  "performedBy": "user_id_here"
}
```

### Report Endpoints

#### Get Dashboard Analytics
```http
GET /api/reports/dashboard
Authorization: Bearer <jwt_token>
```

#### Get Test Volume Report
```http
GET /api/reports/test-volume?startDate=2023-01-01&endDate=2023-12-31
Authorization: Bearer <jwt_token>
```

## User Roles and Permissions

### Admin
- Full system access
- User management
- System configuration
- All reports and analytics

### Lab Manager
- Patient and test management
- Result review and approval
- Staff workload monitoring
- Quality control oversight

### Pathologist
- Result review and approval
- Clinical interpretation
- Critical value management
- Report generation

### Technician
- Test processing
- Result entry
- Sample management
- Basic reporting

### Receptionist
- Patient registration
- Test ordering
- Basic patient information updates
- Appointment scheduling

### Physician
- Patient data access (limited)
- Test ordering
- Result viewing
- Report access

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Granular permissions system
- **Rate Limiting**: API endpoint protection
- **Data Validation**: Input sanitization and validation
- **XSS Protection**: Cross-site scripting prevention
- **CORS Configuration**: Cross-origin request security
- **Helmet Security**: HTTP header security
- **MongoDB Injection Protection**: Query sanitization

## File Upload

The system supports file uploads for:
- User profile images (JPEG, PNG, GIF, WebP - max 5MB)
- Document attachments (PDF, DOC, DOCX, XLS, XLSX, TXT, CSV - max 10MB)
- Report files (PDF, DOC, DOCX - max 20MB)

Files are stored in the `/uploads` directory with organized subdirectories.

## Email Notifications

Automated email notifications are sent for:
- Welcome emails for new users
- Password reset requests
- Critical value alerts
- Test result notifications
- Daily laboratory reports
- System maintenance notifications

## Logging

Comprehensive logging includes:
- **Access Logs**: API request/response logging
- **Error Logs**: Application error tracking
- **Security Logs**: Authentication and authorization events
- **Business Logs**: Laboratory workflow events
- **System Logs**: Application lifecycle events

Logs are stored in the `/logs` directory with automatic rotation.

## Testing

Run the test suite:
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run test suite
- `npm run test:coverage` - Run tests with coverage report
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run seed` - Seed database with sample data
- `npm run backup` - Backup database
- `npm run logs:cleanup` - Clean up old log files

## Database Schema

### Collections

1. **users** - System users with roles and permissions
2. **patients** - Patient demographic and contact information
3. **tests** - Laboratory test orders and tracking
4. **results** - Test results and clinical data
5. **sessions** - User session management (if using session storage)

### Indexes

Optimized indexes are created for:
- User email and employee ID
- Patient search fields
- Test status and dates
- Result parameters and flags

## Error Handling

The API uses consistent error response format:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Specific error message"
    }
  ]
}
```

## Health Check

Monitor application health:
```http
GET /api/health
```

Response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2023-12-01T10:00:00.000Z",
  "environment": "development",
  "version": "1.0.0"
}
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Email: support@quxat.com
- Documentation: [API Docs](https://docs.quxat.com)
- Issues: [GitHub Issues](https://github.com/quxat/lis-backend/issues)

## Changelog

### Version 1.0.0
- Initial release
- Complete LIS functionality
- User management and authentication
- Patient and test management
- Result processing and reporting
- Email notifications
- Comprehensive logging
- Security features