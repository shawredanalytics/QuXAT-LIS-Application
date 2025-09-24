# QuXAT LIS - Streamlit Interface

A modern, web-based Laboratory Information System (LIS) built with Streamlit, providing an intuitive interface for laboratory management, test ordering, results tracking, and comprehensive reporting.

## 🌟 Features

### 🔐 Authentication & Security
- Secure user authentication with role-based access control
- Demo mode for testing and exploration
- Session management with automatic logout
- Multi-role support (Admin, Lab Technician, Doctor, Manager, Receptionist)

### 📊 Dashboard & Analytics
- Real-time laboratory metrics and KPIs
- Interactive charts and visualizations
- Test volume trends and category distribution
- Recent activity monitoring
- Quick statistics overview

### 👥 Patient Management
- Complete patient registration and management
- Advanced search and filtering capabilities
- Patient demographics and contact information
- Insurance and emergency contact tracking
- Patient history and status monitoring

### 🧪 Test Management
- Comprehensive test ordering system
- Support for multiple test categories (Hematology, Chemistry, Microbiology, etc.)
- Priority-based test scheduling (Routine, Urgent, STAT, ASAP)
- Sample type tracking and management
- Test status monitoring and updates

### 📈 Results & Reporting
- Test results entry and validation
- Quality control metrics and monitoring
- Turnaround time analysis
- Automated report generation
- Critical value alerts and notifications

### 👤 User Management (Admin)
- User account creation and management
- Role and permission assignment
- Department-based organization
- Activity monitoring and audit trails

### ⚙️ System Settings
- Laboratory configuration management
- Security policy settings
- Notification preferences
- System maintenance controls

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- pip package manager

### Installation

1. **Clone or download the project**
   ```bash
   cd "C:\Users\MANIKUMAR\Desktop\QuXAT LIS Module\streamlit_app"
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the application**
   ```bash
   streamlit run app.py
   ```

4. **Access the application**
   - Open your web browser
   - Navigate to `http://localhost:8501`
   - Use Demo Mode or configure backend connection

## 🎯 Demo Mode

The application includes a built-in demo mode that allows you to explore all features without requiring a backend connection:

1. Click "Demo Mode" on the login page
2. Explore all modules with sample data
3. Test all functionality in a safe environment

## 🔧 Configuration

### Backend Integration
To connect with the QuXAT LIS backend API:

1. Ensure the backend server is running on `http://localhost:3000`
2. Update the `API_BASE_URL` in `app.py` if using a different address
3. Use actual user credentials for authentication

### Environment Variables
Create a `.env` file for production deployment:
```env
STREAMLIT_SERVER_PORT=8501
STREAMLIT_SERVER_ADDRESS=0.0.0.0
API_BASE_URL=http://localhost:3000/api
```

## 📱 User Interface

### Navigation
- **Sidebar Navigation**: Easy access to all modules
- **Role-based Menus**: Different options based on user permissions
- **Quick Stats**: Real-time metrics in the sidebar
- **Responsive Design**: Works on desktop and mobile devices

### Key Pages

#### 🏠 Dashboard
- Laboratory overview with key metrics
- Test volume trends and analytics
- Recent activity feed
- Performance indicators

#### 👥 Patient Management
- Patient registration and search
- Demographic information management
- Contact and insurance details
- Patient status tracking

#### 🧪 Test Management
- Test ordering interface
- Sample tracking and management
- Priority and status monitoring
- Test category organization

#### 📊 Results & Reports
- Results entry and validation
- Quality control monitoring
- Analytics and reporting
- Critical value management

#### 👤 User Management (Admin Only)
- User account administration
- Role and permission management
- Department organization
- Activity monitoring

#### ⚙️ Settings
- System configuration
- Security settings
- Notification preferences
- Maintenance controls

## 🔒 Security Features

- **Authentication**: Secure login with session management
- **Authorization**: Role-based access control
- **Data Protection**: Secure handling of sensitive information
- **Session Security**: Automatic timeout and logout
- **Audit Trail**: Activity logging and monitoring

## 📊 Analytics & Reporting

### Built-in Analytics
- Test volume trends
- Turnaround time analysis
- Quality metrics monitoring
- Category distribution charts
- Performance dashboards

### Report Generation
- Daily summary reports
- Weekly analytics
- Monthly statistics
- Quality control reports
- Custom date range reports

## 🛠️ Development

### Project Structure
```
streamlit_app/
├── app.py              # Main application file
├── requirements.txt    # Python dependencies
├── README.md          # This file
└── .streamlit/        # Streamlit configuration (optional)
```

### Key Components
- **LISApp Class**: Main application controller
- **Authentication**: Login and session management
- **Page Modules**: Individual feature implementations
- **Data Visualization**: Plotly charts and metrics
- **API Integration**: Backend communication layer

### Customization
The application is designed to be easily customizable:

1. **Styling**: Modify CSS in the `st.markdown()` sections
2. **Features**: Add new pages to the `pages` dictionary
3. **Data Sources**: Update API endpoints or add mock data
4. **Visualizations**: Customize charts using Plotly

## 🔄 Integration with Backend

The Streamlit app is designed to work seamlessly with the QuXAT LIS backend:

### API Endpoints Used
- `POST /api/auth/login` - User authentication
- `GET /api/patients` - Patient data retrieval
- `POST /api/patients` - Patient creation
- `GET /api/tests` - Test data retrieval
- `POST /api/tests` - Test ordering
- `GET /api/results` - Results retrieval
- `POST /api/results` - Results entry

### Data Models
The frontend interfaces with the following backend models:
- **User**: Authentication and role management
- **Patient**: Patient demographics and information
- **Test**: Test orders and tracking
- **Result**: Test results and reporting

## 🚀 Deployment

### Local Development
```bash
streamlit run app.py
```

### Production Deployment
1. **Streamlit Cloud**: Deploy directly from GitHub
2. **Docker**: Containerized deployment
3. **Heroku**: Cloud platform deployment
4. **AWS/Azure**: Enterprise cloud deployment

### Docker Deployment
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8501

CMD ["streamlit", "run", "app.py", "--server.port=8501", "--server.address=0.0.0.0"]
```

## 📝 Usage Examples

### Patient Registration
1. Navigate to Patient Management
2. Click "Add New Patient"
3. Fill in required information
4. Save patient record

### Test Ordering
1. Go to Test Management
2. Enter patient ID
3. Select test type and priority
4. Add clinical notes
5. Submit test order

### Results Entry
1. Access Results & Reports
2. Click "Enter New Results"
3. Input test results and values
4. Add technician notes
5. Save and review

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For technical support or questions:
- **Email**: support@quxat.com
- **Documentation**: [QuXAT LIS Docs](https://docs.quxat.com)
- **Issues**: GitHub Issues page

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔄 Version History

### v1.0.0 (Current)
- Initial Streamlit interface implementation
- Complete LIS functionality
- Demo mode support
- Responsive design
- Role-based access control

---

**QuXAT Laboratory Information System** - Streamlining laboratory operations with modern technology.