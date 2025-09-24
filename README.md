# QuXAT LIS Application

A comprehensive Laboratory Information System (LIS) built with modern web technologies to streamline laboratory operations, patient management, and test result processing.

## 🏥 Overview

QuXAT LIS is a full-stack web application designed to digitize and optimize laboratory workflows. It provides a complete solution for managing patients, laboratory tests, results, and reporting with role-based access control and real-time notifications.

## ✨ Key Features

### 🔐 User Management & Security
- **Multi-role Authentication**: Admin, Lab Manager, Pathologist, Technician, Receptionist, Physician
- **JWT-based Security**: Secure token-based authentication
- **Role-based Access Control**: Granular permissions for different user types
- **Rate Limiting**: Protection against API abuse

### 👥 Patient Management
- **Comprehensive Demographics**: Complete patient information management
- **Medical History**: Track patient medical records and history
- **Search & Filter**: Advanced patient search capabilities
- **Data Validation**: Ensure data integrity and compliance

### 🧪 Laboratory Test Management
- **Test Ordering**: Streamlined test requisition process
- **Sample Tracking**: Complete sample lifecycle management
- **Workflow Management**: From collection → processing → results → reporting
- **Batch Processing**: Handle multiple tests efficiently

### 📊 Results & Reporting
- **Result Entry**: Intuitive result input with validation
- **Quality Control**: Multi-level review and approval workflow
- **Critical Value Alerts**: Automatic notifications for critical results
- **Comprehensive Reports**: Dashboard analytics and custom reports

### 📧 Communication
- **Email Notifications**: Automated alerts for critical values and reports
- **Real-time Updates**: Live status updates across the system
- **Audit Logging**: Complete activity tracking for compliance

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing
- **Nodemailer** - Email service
- **Winston** - Logging framework
- **Multer** - File upload handling

### Frontend
- **React** - User interface library
- **Vite** - Build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Hook Form** - Form handling
- **Chart.js** - Data visualization

## 📁 Project Structure

```
QuXAT LIS Module/
├── backend/                    # Node.js/Express API
│   ├── config/                # Database and app configuration
│   ├── controllers/           # Business logic controllers
│   ├── middleware/            # Custom middleware (auth, validation)
│   ├── models/               # MongoDB/Mongoose models
│   ├── routes/               # API route definitions
│   ├── utils/                # Utility functions and services
│   ├── app.js                # Express app configuration
│   ├── server.js             # Server entry point
│   ├── package.json          # Backend dependencies
│   └── README.md             # Backend documentation
├── frontend/                  # React application
│   ├── public/               # Static assets
│   ├── src/                  # React source code
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service functions
│   │   └── utils/           # Frontend utilities
│   ├── package.json         # Frontend dependencies
│   └── vite.config.js       # Vite configuration
├── database/                 # Database scripts and migrations
├── docs/                     # Project documentation
├── .gitignore               # Git ignore rules
├── README.md                # This file
└── LICENSE                  # Project license
```

## 🚀 Quick Start

### Prerequisites

Before running the application, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **MongoDB** - [Local installation](https://www.mongodb.com/try/download/community) or [MongoDB Atlas](https://www.mongodb.com/atlas)
- **Git** - [Download here](https://git-scm.com/)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/QuXAT-LIS-Application.git
   cd QuXAT-LIS-Application
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Copy environment file and configure
   cp .env.example .env
   # Edit .env with your configuration
   
   # Start the backend server
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   
   # Start the frontend development server
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - API Documentation: http://localhost:5000/api-docs

### Environment Configuration

Create a `.env` file in the backend directory with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/quxat_lis

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Laboratory Information
LAB_NAME=QuXAT Laboratory
LAB_ADDRESS=Your Lab Address
LAB_PHONE=+1-234-567-8900
LAB_EMAIL=lab@quxat.com

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

## 👥 User Roles & Permissions

| Role | Permissions |
|------|-------------|
| **Admin** | Full system access, user management, system configuration |
| **Lab Manager** | Manage tests, results, reports, staff oversight |
| **Pathologist** | Review and approve results, critical value management |
| **Technician** | Process tests, enter results, sample management |
| **Receptionist** | Patient registration, appointment scheduling |
| **Physician** | View patient results, order tests |

## 📚 API Documentation

The backend provides a comprehensive REST API with the following main endpoints:

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Patients
- `GET /api/patients` - Get all patients (with pagination)
- `POST /api/patients` - Create new patient
- `GET /api/patients/:id` - Get patient by ID
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Soft delete patient

### Tests
- `GET /api/tests` - Get all tests
- `POST /api/tests` - Create new test
- `PUT /api/tests/:id/collect` - Mark sample as collected
- `PUT /api/tests/:id/process` - Start test processing
- `PUT /api/tests/:id/complete` - Complete test

### Results
- `GET /api/results` - Get all results
- `POST /api/results` - Create new result
- `PUT /api/results/:id/review` - Review result
- `PUT /api/results/:id/approve` - Approve result
- `POST /api/results/:id/critical` - Report critical value

### Reports
- `GET /api/reports/dashboard` - Dashboard analytics
- `GET /api/reports/test-volume` - Test volume reports
- `GET /api/reports/turnaround-time` - TAT analysis
- `GET /api/reports/quality-control` - QC reports

For detailed API documentation, see the [Backend README](./backend/README.md).

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test                    # Run all tests
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Run tests with coverage
```

### Frontend Testing
```bash
cd frontend
npm test                   # Run component tests
npm run test:e2e          # Run end-to-end tests
```

## 🚀 Deployment

### Production Build

1. **Backend Production**
   ```bash
   cd backend
   npm run build
   npm start
   ```

2. **Frontend Production**
   ```bash
   cd frontend
   npm run build
   # Serve the dist/ folder with your web server
   ```

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build individual containers
docker build -t quxat-backend ./backend
docker build -t quxat-frontend ./frontend
```

## 🔒 Security Features

- **Input Validation**: Comprehensive data validation using express-validator
- **SQL Injection Protection**: MongoDB injection prevention
- **XSS Protection**: Cross-site scripting prevention
- **CORS Configuration**: Proper cross-origin resource sharing setup
- **Rate Limiting**: API abuse prevention
- **Helmet.js**: Security headers configuration
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt for secure password storage

## 📊 Monitoring & Logging

- **Winston Logging**: Structured logging with multiple transports
- **Error Tracking**: Comprehensive error handling and reporting
- **Performance Monitoring**: Request/response time tracking
- **Audit Trails**: Complete user activity logging
- **Health Checks**: System health monitoring endpoints

## 🤝 Contributing

We welcome contributions to the QuXAT LIS Application! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and conventions
- Write comprehensive tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR
- Use meaningful commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- **Documentation**: Check the [docs](./docs) folder
- **Issues**: Create an issue on GitHub
- **Email**: support@quxat.com
- **Discord**: Join our community server

## 🗺️ Roadmap

### Version 2.0 (Planned)
- [ ] Mobile application (React Native)
- [ ] Advanced analytics and AI insights
- [ ] Integration with laboratory instruments
- [ ] Multi-language support
- [ ] Advanced reporting with custom templates

### Version 1.1 (In Progress)
- [ ] Real-time notifications
- [ ] Barcode scanning support
- [ ] Advanced search and filtering
- [ ] Export functionality improvements

## 📈 Changelog

### Version 1.0.0 (Current)
- ✅ Complete backend API with authentication
- ✅ User management with role-based access
- ✅ Patient management system
- ✅ Test ordering and processing workflow
- ✅ Results management with approval workflow
- ✅ Comprehensive reporting and analytics
- ✅ Email notification system
- ✅ File upload and management
- ✅ Audit logging and monitoring

---

**Built with ❤️ by the QuXAT Team**

For more information, visit our [website](https://quxat.com) or check out our [documentation](./docs).