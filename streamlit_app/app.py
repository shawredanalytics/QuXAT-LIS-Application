import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime, timedelta
import requests
import json
from typing import Dict, List, Optional

# Configure Streamlit page
st.set_page_config(
    page_title="QuXAT LIS - Laboratory Information System",
    page_icon="🧪",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for better styling
st.markdown("""
<style>
    .main-header {
        font-size: 2.5rem;
        font-weight: bold;
        color: #1f77b4;
        text-align: center;
        margin-bottom: 2rem;
    }
    .metric-card {
        background-color: #f0f2f6;
        padding: 1rem;
        border-radius: 0.5rem;
        border-left: 4px solid #1f77b4;
    }
    .sidebar-header {
        font-size: 1.2rem;
        font-weight: bold;
        color: #1f77b4;
        margin-bottom: 1rem;
    }
    .status-badge {
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        font-size: 0.8rem;
        font-weight: bold;
    }
    .status-completed { background-color: #d4edda; color: #155724; }
    .status-processing { background-color: #fff3cd; color: #856404; }
    .status-ordered { background-color: #cce5ff; color: #004085; }
    .status-urgent { background-color: #f8d7da; color: #721c24; }
</style>
""", unsafe_allow_html=True)

# Initialize session state
if 'authenticated' not in st.session_state:
    st.session_state.authenticated = False
if 'user_role' not in st.session_state:
    st.session_state.user_role = None
if 'user_name' not in st.session_state:
    st.session_state.user_name = None

# API Configuration
API_BASE_URL = "http://localhost:3000/api"

class LISApp:
    def __init__(self):
        self.pages = {
            "🏠 Dashboard": self.dashboard_page,
            "👥 Patient Management": self.patient_management_page,
            "🧪 Test Management": self.test_management_page,
            "📊 Results & Reports": self.results_page,
            "👤 User Management": self.user_management_page,
            "⚙️ Settings": self.settings_page
        }
    
    def run(self):
        """Main application runner"""
        if not st.session_state.authenticated:
            self.login_page()
        else:
            self.main_app()
    
    def login_page(self):
        """Authentication page"""
        st.markdown('<div class="main-header">🧪 QuXAT Laboratory Information System</div>', unsafe_allow_html=True)
        
        col1, col2, col3 = st.columns([1, 2, 1])
        
        with col2:
            st.markdown("### 🔐 User Authentication")
            
            with st.form("login_form"):
                email = st.text_input("📧 Email", placeholder="Enter your email")
                password = st.text_input("🔒 Password", type="password", placeholder="Enter your password")
                
                col_login, col_demo = st.columns(2)
                
                with col_login:
                    login_clicked = st.form_submit_button("🚀 Login", use_container_width=True)
                
                with col_demo:
                    demo_clicked = st.form_submit_button("🎯 Demo Mode", use_container_width=True)
                
                if login_clicked:
                    if self.authenticate_user(email, password):
                        st.success("✅ Login successful!")
                        st.rerun()
                    else:
                        st.error("❌ Invalid credentials. Please try again.")
                
                if demo_clicked:
                    # Demo mode for testing
                    st.session_state.authenticated = True
                    st.session_state.user_role = "admin"
                    st.session_state.user_name = "Demo User"
                    st.success("✅ Demo mode activated!")
                    st.rerun()
            
            # Demo credentials info
            with st.expander("ℹ️ Demo Credentials"):
                st.info("""
                **Demo Mode Available**
                - Click 'Demo Mode' to explore the application
                - Full functionality with sample data
                - No backend connection required
                """)
    
    def authenticate_user(self, email: str, password: str) -> bool:
        """Authenticate user with backend API"""
        try:
            response = requests.post(f"{API_BASE_URL}/auth/login", 
                                   json={"email": email, "password": password})
            if response.status_code == 200:
                user_data = response.json()
                st.session_state.authenticated = True
                st.session_state.user_role = user_data.get('role', 'lab_technician')
                st.session_state.user_name = f"{user_data.get('firstName', '')} {user_data.get('lastName', '')}"
                return True
        except requests.exceptions.RequestException:
            # Fallback for demo mode when backend is not available
            pass
        return False
    
    def main_app(self):
        """Main application interface"""
        # Sidebar navigation
        with st.sidebar:
            st.markdown(f'<div class="sidebar-header">👋 Welcome, {st.session_state.user_name}</div>', unsafe_allow_html=True)
            st.markdown(f"**Role:** {st.session_state.user_role.replace('_', ' ').title()}")
            
            st.markdown("---")
            
            # Navigation
            selected_page = st.selectbox("📋 Navigation", list(self.pages.keys()))
            
            st.markdown("---")
            
            # Quick stats
            st.markdown("### 📈 Quick Stats")
            col1, col2 = st.columns(2)
            with col1:
                st.metric("Today's Tests", "47", "↑ 12%")
            with col2:
                st.metric("Pending Results", "8", "↓ 3")
            
            st.markdown("---")
            
            # Logout button
            if st.button("🚪 Logout", use_container_width=True):
                for key in list(st.session_state.keys()):
                    del st.session_state[key]
                st.rerun()
        
        # Main content area
        self.pages[selected_page]()
    
    def dashboard_page(self):
        """Dashboard with key metrics and charts"""
        st.markdown('<div class="main-header">🏠 Laboratory Dashboard</div>', unsafe_allow_html=True)
        
        # Key metrics
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            st.metric(
                label="📋 Total Tests Today",
                value="47",
                delta="12 from yesterday"
            )
        
        with col2:
            st.metric(
                label="⏳ Pending Results",
                value="8",
                delta="-3 from yesterday"
            )
        
        with col3:
            st.metric(
                label="👥 Active Patients",
                value="156",
                delta="5 new today"
            )
        
        with col4:
            st.metric(
                label="🎯 Completion Rate",
                value="94.2%",
                delta="2.1% improvement"
            )
        
        st.markdown("---")
        
        # Charts section
        col1, col2 = st.columns(2)
        
        with col1:
            st.subheader("📊 Test Volume Trends")
            # Sample data for demonstration
            dates = pd.date_range(start='2024-01-01', end='2024-01-31', freq='D')
            test_counts = [30 + i % 20 + (i // 7) * 5 for i in range(len(dates))]
            
            fig = px.line(x=dates, y=test_counts, title="Daily Test Volume")
            fig.update_layout(xaxis_title="Date", yaxis_title="Number of Tests")
            st.plotly_chart(fig, use_container_width=True)
        
        with col2:
            st.subheader("🧪 Test Categories Distribution")
            categories = ['Hematology', 'Chemistry', 'Microbiology', 'Immunology', 'Pathology']
            values = [25, 35, 15, 15, 10]
            
            fig = px.pie(values=values, names=categories, title="Test Distribution by Category")
            st.plotly_chart(fig, use_container_width=True)
        
        # Recent activity
        st.subheader("🕒 Recent Activity")
        recent_data = {
            'Time': ['10:30 AM', '10:15 AM', '09:45 AM', '09:30 AM', '09:15 AM'],
            'Activity': [
                'Test completed: CBC for Patient P001',
                'New test ordered: Lipid Panel for Patient P045',
                'Critical result flagged: Glucose level for Patient P023',
                'Sample collected: Urinalysis for Patient P067',
                'Patient registered: John Doe (P089)'
            ],
            'Status': ['Completed', 'Ordered', 'Critical', 'Collected', 'Registered']
        }
        
        df = pd.DataFrame(recent_data)
        st.dataframe(df, use_container_width=True, hide_index=True)
    
    def patient_management_page(self):
        """Patient management interface"""
        st.markdown('<div class="main-header">👥 Patient Management</div>', unsafe_allow_html=True)
        
        # Action buttons
        col1, col2, col3 = st.columns([2, 1, 1])
        
        with col1:
            search_term = st.text_input("🔍 Search Patients", placeholder="Enter patient ID, name, or phone")
        
        with col2:
            if st.button("➕ Add New Patient", use_container_width=True):
                st.session_state.show_add_patient = True
        
        with col3:
            if st.button("📊 Export Data", use_container_width=True):
                st.success("Export functionality would be implemented here")
        
        # Add new patient form
        if st.session_state.get('show_add_patient', False):
            with st.expander("➕ Add New Patient", expanded=True):
                with st.form("add_patient_form"):
                    col1, col2 = st.columns(2)
                    
                    with col1:
                        first_name = st.text_input("First Name*")
                        last_name = st.text_input("Last Name*")
                        dob = st.date_input("Date of Birth*")
                        gender = st.selectbox("Gender*", ["male", "female", "other"])
                    
                    with col2:
                        email = st.text_input("Email")
                        phone = st.text_input("Phone*")
                        emergency_contact = st.text_input("Emergency Contact")
                        insurance_provider = st.text_input("Insurance Provider")
                    
                    address_col1, address_col2 = st.columns(2)
                    with address_col1:
                        street = st.text_input("Street Address")
                        city = st.text_input("City")
                    
                    with address_col2:
                        state = st.text_input("State")
                        zip_code = st.text_input("ZIP Code")
                    
                    col_submit, col_cancel = st.columns(2)
                    
                    with col_submit:
                        if st.form_submit_button("💾 Save Patient", use_container_width=True):
                            st.success("✅ Patient added successfully!")
                            st.session_state.show_add_patient = False
                            st.rerun()
                    
                    with col_cancel:
                        if st.form_submit_button("❌ Cancel", use_container_width=True):
                            st.session_state.show_add_patient = False
                            st.rerun()
        
        # Patient list
        st.subheader("📋 Patient List")
        
        # Sample patient data
        patients_data = {
            'Patient ID': ['P001', 'P002', 'P003', 'P004', 'P005'],
            'Name': ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Brown', 'Charlie Wilson'],
            'Age': [45, 32, 67, 28, 55],
            'Gender': ['Male', 'Female', 'Male', 'Female', 'Male'],
            'Phone': ['+1-555-0101', '+1-555-0102', '+1-555-0103', '+1-555-0104', '+1-555-0105'],
            'Last Visit': ['2024-01-15', '2024-01-14', '2024-01-13', '2024-01-12', '2024-01-11'],
            'Status': ['Active', 'Active', 'Inactive', 'Active', 'Active']
        }
        
        df_patients = pd.DataFrame(patients_data)
        
        # Filter patients based on search
        if search_term:
            mask = df_patients.apply(lambda x: x.astype(str).str.contains(search_term, case=False, na=False)).any(axis=1)
            df_patients = df_patients[mask]
        
        # Display patients with action buttons
        for idx, row in df_patients.iterrows():
            with st.container():
                col1, col2, col3, col4 = st.columns([3, 2, 2, 1])
                
                with col1:
                    st.write(f"**{row['Name']}** ({row['Patient ID']})")
                    st.write(f"Age: {row['Age']}, Gender: {row['Gender']}")
                
                with col2:
                    st.write(f"📞 {row['Phone']}")
                    st.write(f"Last Visit: {row['Last Visit']}")
                
                with col3:
                    status_class = "status-completed" if row['Status'] == 'Active' else "status-processing"
                    st.markdown(f'<span class="status-badge {status_class}">{row["Status"]}</span>', unsafe_allow_html=True)
                
                with col4:
                    if st.button("👁️", key=f"view_{idx}", help="View Details"):
                        st.info(f"View details for {row['Name']}")
                
                st.markdown("---")
    
    def test_management_page(self):
        """Test management interface"""
        st.markdown('<div class="main-header">🧪 Test Management</div>', unsafe_allow_html=True)
        
        # Test ordering section
        col1, col2 = st.columns([2, 1])
        
        with col1:
            st.subheader("📝 Order New Test")
        
        with col2:
            if st.button("📋 View All Tests", use_container_width=True):
                st.session_state.view_mode = "all_tests"
        
        # Test ordering form
        with st.form("order_test_form"):
            col1, col2 = st.columns(2)
            
            with col1:
                patient_id = st.text_input("Patient ID*", placeholder="Enter patient ID")
                test_type = st.selectbox("Test Type*", [
                    'complete_blood_count', 'basic_metabolic_panel', 'lipid_panel',
                    'liver_function_test', 'thyroid_function_test', 'urinalysis',
                    'blood_glucose', 'hemoglobin_a1c', 'cholesterol'
                ])
                category = st.selectbox("Category*", [
                    'hematology', 'chemistry', 'microbiology', 'immunology', 'pathology'
                ])
            
            with col2:
                priority = st.selectbox("Priority*", ['routine', 'urgent', 'stat', 'asap'])
                sample_type = st.selectbox("Sample Type*", [
                    'blood', 'urine', 'stool', 'sputum', 'csf', 'tissue', 'swab'
                ])
                notes = st.text_area("Clinical Notes", placeholder="Enter any relevant clinical information")
            
            if st.form_submit_button("🚀 Order Test", use_container_width=True):
                st.success("✅ Test ordered successfully!")
        
        st.markdown("---")
        
        # Current tests overview
        st.subheader("📊 Current Tests Overview")
        
        # Test status metrics
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            st.metric("📋 Ordered", "12", "↑ 3")
        
        with col2:
            st.metric("🔬 Processing", "8", "↓ 2")
        
        with col3:
            st.metric("✅ Completed", "25", "↑ 7")
        
        with col4:
            st.metric("⚠️ Critical", "2", "↑ 1")
        
        # Tests table
        st.subheader("🧪 Active Tests")
        
        tests_data = {
            'Test ID': ['T001', 'T002', 'T003', 'T004', 'T005'],
            'Patient': ['John Doe (P001)', 'Jane Smith (P002)', 'Bob Johnson (P003)', 'Alice Brown (P004)', 'Charlie Wilson (P005)'],
            'Test Type': ['CBC', 'Lipid Panel', 'Liver Function', 'Urinalysis', 'Glucose'],
            'Priority': ['Routine', 'Urgent', 'Stat', 'Routine', 'Urgent'],
            'Status': ['Processing', 'Completed', 'Ordered', 'Completed', 'Processing'],
            'Ordered Date': ['2024-01-15', '2024-01-14', '2024-01-15', '2024-01-13', '2024-01-15']
        }
        
        df_tests = pd.DataFrame(tests_data)
        
        # Add status styling
        def style_status(val):
            if val == 'Completed':
                return 'background-color: #d4edda'
            elif val == 'Processing':
                return 'background-color: #fff3cd'
            elif val == 'Ordered':
                return 'background-color: #cce5ff'
            return ''
        
        styled_df = df_tests.style.applymap(style_status, subset=['Status'])
        st.dataframe(styled_df, use_container_width=True, hide_index=True)
    
    def results_page(self):
        """Results and reports interface"""
        st.markdown('<div class="main-header">📊 Results & Reports</div>', unsafe_allow_html=True)
        
        # Tab navigation
        tab1, tab2, tab3 = st.tabs(["🔬 Test Results", "📈 Analytics", "📄 Reports"])
        
        with tab1:
            st.subheader("🔬 Test Results Entry & Review")
            
            # Results entry form
            with st.expander("➕ Enter New Results", expanded=False):
                with st.form("results_form"):
                    col1, col2 = st.columns(2)
                    
                    with col1:
                        test_id = st.text_input("Test ID*")
                        result_value = st.text_input("Result Value*")
                        unit = st.text_input("Unit")
                        reference_range = st.text_input("Reference Range")
                    
                    with col2:
                        status = st.selectbox("Status", ['normal', 'abnormal', 'critical', 'pending'])
                        technician_notes = st.text_area("Technician Notes")
                        reviewed_by = st.text_input("Reviewed By")
                    
                    if st.form_submit_button("💾 Save Results"):
                        st.success("✅ Results saved successfully!")
            
            # Recent results
            st.subheader("📋 Recent Results")
            
            results_data = {
                'Test ID': ['T001', 'T002', 'T003', 'T004'],
                'Patient': ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Brown'],
                'Test': ['CBC', 'Lipid Panel', 'Liver Function', 'Urinalysis'],
                'Result': ['Normal', 'Cholesterol: 245 mg/dL', 'ALT: 45 U/L', 'Normal'],
                'Status': ['Normal', 'Abnormal', 'Abnormal', 'Normal'],
                'Date': ['2024-01-15', '2024-01-14', '2024-01-13', '2024-01-12']
            }
            
            df_results = pd.DataFrame(results_data)
            st.dataframe(df_results, use_container_width=True, hide_index=True)
        
        with tab2:
            st.subheader("📈 Laboratory Analytics")
            
            col1, col2 = st.columns(2)
            
            with col1:
                # Test turnaround time
                st.write("⏱️ **Average Turnaround Time**")
                tat_data = {
                    'Test Type': ['CBC', 'Chemistry Panel', 'Microbiology', 'Immunology'],
                    'Avg Time (hours)': [2.5, 4.2, 24.0, 6.8],
                    'Target (hours)': [4.0, 6.0, 48.0, 8.0]
                }
                
                fig = px.bar(tat_data, x='Test Type', y=['Avg Time (hours)', 'Target (hours)'],
                           title="Turnaround Time vs Target", barmode='group')
                st.plotly_chart(fig, use_container_width=True)
            
            with col2:
                # Quality metrics
                st.write("🎯 **Quality Metrics**")
                quality_data = {
                    'Metric': ['Accuracy', 'Precision', 'Contamination Rate', 'Repeat Rate'],
                    'Current': [98.5, 97.2, 0.8, 2.1],
                    'Target': [99.0, 98.0, 1.0, 2.0]
                }
                
                fig = go.Figure()
                fig.add_trace(go.Scatter(x=quality_data['Metric'], y=quality_data['Current'],
                                       mode='markers+lines', name='Current', marker_size=10))
                fig.add_trace(go.Scatter(x=quality_data['Metric'], y=quality_data['Target'],
                                       mode='markers+lines', name='Target', marker_size=10))
                fig.update_layout(title="Quality Metrics Dashboard")
                st.plotly_chart(fig, use_container_width=True)
        
        with tab3:
            st.subheader("📄 Laboratory Reports")
            
            # Report generation
            col1, col2 = st.columns(2)
            
            with col1:
                st.write("📊 **Generate Reports**")
                report_type = st.selectbox("Report Type", [
                    'Daily Summary', 'Weekly Analytics', 'Monthly Statistics',
                    'Quality Control', 'Turnaround Time', 'Patient Demographics'
                ])
                
                date_range = st.date_input("Date Range", value=[datetime.now() - timedelta(days=7), datetime.now()])
                
                if st.button("📄 Generate Report", use_container_width=True):
                    st.success(f"✅ {report_type} report generated successfully!")
            
            with col2:
                st.write("📁 **Recent Reports**")
                reports_data = {
                    'Report Name': ['Daily Summary - Jan 15', 'Weekly Analytics - Week 2', 'QC Report - Jan 14'],
                    'Generated': ['2024-01-15 09:00', '2024-01-14 17:30', '2024-01-14 16:15'],
                    'Size': ['2.3 MB', '5.7 MB', '1.8 MB']
                }
                
                df_reports = pd.DataFrame(reports_data)
                st.dataframe(df_reports, use_container_width=True, hide_index=True)
    
    def user_management_page(self):
        """User management interface (admin only)"""
        if st.session_state.user_role != 'admin':
            st.error("🚫 Access denied. Admin privileges required.")
            return
        
        st.markdown('<div class="main-header">👤 User Management</div>', unsafe_allow_html=True)
        
        # User statistics
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            st.metric("👥 Total Users", "24", "↑ 2")
        
        with col2:
            st.metric("🟢 Active Users", "22", "↑ 1")
        
        with col3:
            st.metric("👨‍⚕️ Doctors", "8", "→ 0")
        
        with col4:
            st.metric("🧪 Lab Techs", "12", "↑ 1")
        
        # Add new user
        with st.expander("➕ Add New User"):
            with st.form("add_user_form"):
                col1, col2 = st.columns(2)
                
                with col1:
                    first_name = st.text_input("First Name*")
                    last_name = st.text_input("Last Name*")
                    email = st.text_input("Email*")
                    employee_id = st.text_input("Employee ID")
                
                with col2:
                    role = st.selectbox("Role*", ['admin', 'lab_technician', 'doctor', 'receptionist', 'manager'])
                    department = st.selectbox("Department*", ['hematology', 'chemistry', 'microbiology', 'immunology', 'pathology', 'administration'])
                    phone = st.text_input("Phone")
                    password = st.text_input("Temporary Password*", type="password")
                
                if st.form_submit_button("👤 Create User"):
                    st.success("✅ User created successfully!")
        
        # Users list
        st.subheader("👥 Current Users")
        
        users_data = {
            'Name': ['John Admin', 'Jane Tech', 'Dr. Smith', 'Bob Manager', 'Alice Lab'],
            'Email': ['admin@quxat.com', 'jane@quxat.com', 'smith@quxat.com', 'bob@quxat.com', 'alice@quxat.com'],
            'Role': ['Admin', 'Lab Technician', 'Doctor', 'Manager', 'Lab Technician'],
            'Department': ['Administration', 'Chemistry', 'Pathology', 'Administration', 'Hematology'],
            'Status': ['Active', 'Active', 'Active', 'Inactive', 'Active'],
            'Last Login': ['2024-01-15 09:30', '2024-01-15 08:45', '2024-01-14 16:20', '2024-01-10 14:30', '2024-01-15 07:15']
        }
        
        df_users = pd.DataFrame(users_data)
        st.dataframe(df_users, use_container_width=True, hide_index=True)
    
    def settings_page(self):
        """Application settings"""
        st.markdown('<div class="main-header">⚙️ System Settings</div>', unsafe_allow_html=True)
        
        # Settings tabs
        tab1, tab2, tab3 = st.tabs(["🔧 General", "🔐 Security", "📧 Notifications"])
        
        with tab1:
            st.subheader("🔧 General Settings")
            
            col1, col2 = st.columns(2)
            
            with col1:
                st.write("**Laboratory Information**")
                lab_name = st.text_input("Laboratory Name", value="QuXAT Laboratory")
                lab_address = st.text_area("Laboratory Address")
                lab_phone = st.text_input("Phone Number")
                lab_email = st.text_input("Email Address")
            
            with col2:
                st.write("**System Configuration**")
                timezone = st.selectbox("Timezone", ["UTC", "EST", "PST", "CST"])
                date_format = st.selectbox("Date Format", ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"])
                auto_backup = st.checkbox("Enable Auto Backup", value=True)
                maintenance_mode = st.checkbox("Maintenance Mode", value=False)
        
        with tab2:
            st.subheader("🔐 Security Settings")
            
            col1, col2 = st.columns(2)
            
            with col1:
                st.write("**Password Policy**")
                min_length = st.number_input("Minimum Password Length", min_value=6, max_value=20, value=8)
                require_special = st.checkbox("Require Special Characters", value=True)
                require_numbers = st.checkbox("Require Numbers", value=True)
                password_expiry = st.number_input("Password Expiry (days)", min_value=30, max_value=365, value=90)
            
            with col2:
                st.write("**Session Management**")
                session_timeout = st.number_input("Session Timeout (minutes)", min_value=15, max_value=480, value=60)
                max_login_attempts = st.number_input("Max Login Attempts", min_value=3, max_value=10, value=5)
                two_factor_auth = st.checkbox("Enable Two-Factor Authentication", value=False)
        
        with tab3:
            st.subheader("📧 Notification Settings")
            
            col1, col2 = st.columns(2)
            
            with col1:
                st.write("**Email Notifications**")
                critical_results = st.checkbox("Critical Results Alert", value=True)
                test_completion = st.checkbox("Test Completion Notice", value=True)
                system_alerts = st.checkbox("System Alerts", value=True)
                daily_summary = st.checkbox("Daily Summary Report", value=False)
            
            with col2:
                st.write("**Alert Thresholds**")
                turnaround_threshold = st.number_input("Turnaround Time Alert (hours)", min_value=1, max_value=48, value=24)
                quality_threshold = st.number_input("Quality Score Alert (%)", min_value=80, max_value=99, value=95)
                capacity_threshold = st.number_input("Capacity Alert (%)", min_value=70, max_value=95, value=85)
        
        # Save settings button
        if st.button("💾 Save All Settings", use_container_width=True):
            st.success("✅ Settings saved successfully!")

# Run the application
if __name__ == "__main__":
    app = LISApp()
    app.run()