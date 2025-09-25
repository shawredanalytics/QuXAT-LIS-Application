from datetime import datetime

class LISApp:
    def __init__(self):
        self.session_state = {}

    def run(self):
        st.session_state.authenticated = False
        st.session_state.user_role = None
        st.session_state.user_name = None
        st.session_state.admin_mode = False
        st.rerun()

    def login(self):
        """Login function"""
        st.session_state.authenticated = True
        st.session_state.user_role = "lab_technician"
        st.session_state.user_name = "John Doe"
        st.session_state.admin_mode = False
        st.rerun()

    def patient_management_page(self):
        """Patient management interface"""
        st.markdown('<div class="main-header">👥 Patient Management</div>', unsafe_allow_html=True)
        
        # Patient registration form
        with st.expander("➕ Register New Patient", expanded=False):
            with st.form("patient_form"):
                col1, col2 = st.columns(2)
                
                with col1:
                    first_name = st.text_input("First Name")
                    last_name = st.text_input("Last Name")
                    date_of_birth = st.date_input("Date of Birth")
                    gender = st.selectbox("Gender", ["Male", "Female", "Other"])
                
                with col2:
                    phone = st.text_input("Phone Number")
                    email = st.text_input("Email")
                    address = st.text_area("Address")
                    emergency_contact = st.text_input("Emergency Contact")
                
                submitted = st.form_submit_button("Register Patient")
                
                if submitted:
                    st.success("✅ Patient registered successfully!")
                    st.info("🔄 Connect to backend API to save patient data")
        
        st.markdown("---")
        
        # Patient search and list
        st.markdown("### 🔍 Patient Search")
        search_term = st.text_input("Search patients by name, ID, or phone")
        
        if search_term:
            st.info(f"🔍 Searching for: {search_term}")
            st.info("🔄 Connect to backend API to search patients")
        else:
            st.info("📋 Connect to backend API to display patient list")
    
    def test_management_page(self):
        """Test management interface"""
        st.markdown('<div class="main-header">🧪 Test Management</div>', unsafe_allow_html=True)
        
        # Test ordering form
        with st.expander("➕ Order New Test", expanded=False):
            with st.form("test_form"):
                col1, col2 = st.columns(2)
                
                with col1:
                    patient_id = st.text_input("Patient ID")
                    test_type = st.selectbox("Test Type", [
                        "Blood Chemistry", "Hematology", "Microbiology", 
                        "Immunology", "Molecular", "Pathology"
                    ])
                    priority = st.selectbox("Priority", ["Routine", "Urgent", "STAT"])
                
                with col2:
                    ordered_by = st.text_input("Ordered By (Doctor)")
                    collection_date = st.date_input("Collection Date")
                    notes = st.text_area("Special Instructions")
                
                submitted = st.form_submit_button("Order Test")
                
                if submitted:
                    st.success("✅ Test ordered successfully!")
                    st.info("🔄 Connect to backend API to save test order")
        
        st.markdown("---")
        
        # Test tracking
        st.markdown("### 📊 Test Tracking")
        
        tab1, tab2, tab3 = st.tabs(["🔄 In Progress", "✅ Completed", "⚠️ Critical"])
        
        with tab1:
            st.info("🔄 Connect to backend API to display in-progress tests")
        
        with tab2:
            st.info("✅ Connect to backend API to display completed tests")
        
        with tab3:
            st.info("⚠️ Connect to backend API to display critical results")
    
    def test_results_entry_page(self):
        """Test Results Entry Interface"""
        st.markdown('<div class="main-header">📝 Test Results Entry</div>', unsafe_allow_html=True)
        
        # Test selection and results entry
        col1, col2 = st.columns([1, 2])
        
        with col1:
            st.markdown("### 🔍 Select Test")
            
            # Search filters
            search_patient = st.text_input("🔍 Search Patient ID/Name")
            filter_status = st.selectbox("Filter by Status", 
                ["All", "Collected", "Processing", "Pending Results"])
            filter_priority = st.selectbox("Filter by Priority", 
                ["All", "STAT", "Urgent", "Routine"])
            
            # Mock test list (in production, this would come from backend API)
            if 'pending_tests' not in st.session_state:
                st.session_state.pending_tests = [
                    {
                        "testId": "TEST000001",
                        "patientId": "PAT001",
                        "patientName": "John Doe",
                        "testType": "complete_blood_count",
                        "category": "hematology",
                        "priority": "routine",
                        "status": "collected",
                        "sampleType": "blood",
                        "collectionDate": "2024-01-15"
                    },
                    {
                        "testId": "TEST000002", 
                        "patientId": "PAT002",
                        "patientName": "Jane Smith",
                        "testType": "basic_metabolic_panel",
                        "category": "chemistry",
                        "priority": "urgent",
                        "status": "processing",
                        "sampleType": "blood",
                        "collectionDate": "2024-01-15"
                    },
                    {
                        "testId": "TEST000003",
                        "patientId": "PAT003", 
                        "patientName": "Bob Johnson",
                        "testType": "urinalysis",
                        "category": "chemistry",
                        "priority": "stat",
                        "status": "collected",
                        "sampleType": "urine",
                        "collectionDate": "2024-01-15"
                    }
                ]
            
            # Add custom test panels to pending tests if they exist
            if 'custom_test_panels' in st.session_state and st.session_state.custom_test_panels:
                # Convert custom test panels to pending tests format
                for panel in st.session_state.custom_test_panels:
                    if panel['status'] == 'active':
                        # Check if this panel is already in pending tests
                        existing_test = next((t for t in st.session_state.pending_tests if t.get('testCode') == panel['test_code']), None)
                        if not existing_test:
                            custom_test = {
                                "testId": f"CUSTOM_{panel['id']}",
                                "patientId": "CUSTOM_PAT",
                                "patientName": "Custom Test Panel",
                                "testType": panel['test_code'].lower().replace(' ', '_'),
                                "testCode": panel['test_code'],
                                "testName": panel['test_name'],
                                "category": panel['category'].lower(),
                                "priority": "routine",
                                "status": "ready_for_testing",
                                "sampleType": panel['sample_type'].lower(),
                                "collectionDate": panel['collection_date'],
                                "collectionTime": panel['collection_time'],
                                "testingDate": panel['testing_date'],
                                "testingTime": panel['testing_time'],
                                "testMethod": panel['test_method'],
                                "parameters": panel['parameters'],
                                "authorizationLevel": panel['authorization_level'],
                                "requiresAuthorization": panel['requires_authorization'],
                                "isCustomPanel": True
                            }
                            st.session_state.pending_tests.append(custom_test)
            
            # Display filtered tests
            filtered_tests = st.session_state.pending_tests
            if search_patient:
                filtered_tests = [t for t in filtered_tests if 
                    search_patient.lower() in t['patientId'].lower() or 
                    search_patient.lower() in t['patientName'].lower()]
            
            if filter_status != "All":
                status_map = {"Collected": "collected", "Processing": "processing", "Pending Results": "pending"}
                filtered_tests = [t for t in filtered_tests if t['status'] == status_map.get(filter_status, filter_status.lower())]
            
            if filter_priority != "All":
                filtered_tests = [t for t in filtered_tests if t['priority'] == filter_priority.lower()]
            
            # Test selection
            if filtered_tests:
                selected_test_idx = st.selectbox(
                    "Select Test to Enter Results:",
                    range(len(filtered_tests)),
                    format_func=lambda x: f"{filtered_tests[x]['testId']} - {filtered_tests[x]['patientName']} ({filtered_tests[x]['testType']})"
                )
                selected_test = filtered_tests[selected_test_idx]
            else:
                st.warning("No tests found matching the criteria")
                selected_test = None
        
        with col2:
            if selected_test:
                st.markdown("### 📋 Enter Results")
                
                # Display test information
                st.markdown(f"""
                **Test ID:** {selected_test['testId']}  
                **Patient:** {selected_test['patientName']} ({selected_test['patientId']})  
                **Test Type:** {selected_test['testType'].replace('_', ' ').title()}  
                **Category:** {selected_test['category'].title()}  
                **Priority:** {selected_test['priority'].upper()}  
                **Sample Type:** {selected_test['sampleType'].title()}  
                **Collection Date:** {selected_test['collectionDate']}
                """)
                
                st.markdown("---")
                
                # Dynamic results form based on test type
                with st.form("results_entry_form"):
                    st.markdown("#### 🧪 Test Parameters & Results")
                    
                    # Define test parameters based on test type
                    test_parameters = self.get_test_parameters(selected_test['testType'], selected_test)
                    
                    results_data = {}
                    for param in test_parameters:
                        col_param, col_value, col_unit, col_flag = st.columns([2, 1, 1, 1])
                        
                        with col_param:
                            st.write(f"**{param['name']}**")
                        
                        with col_value:
                            value = st.number_input(
                                "Value",
                                key=f"value_{param['key']}",
                                label_visibility="collapsed",
                                format=param.get('format', '%.2f')
                            )
                        
                        with col_unit:
                            st.write(param['unit'])
                        
                        with col_flag:
                            flag = st.selectbox(
                                "Flag",
                                ["Normal", "High", "Low", "Critical High", "Critical Low"],
                                key=f"flag_{param['key']}",
                                label_visibility="collapsed"
                            )
                        
                        results_data[param['key']] = {
                            'parameter': param['name'],
                            'value': value,
                            'unit': param['unit'],
                            'flag': flag.lower().replace(' ', '_'),
                            'referenceRange': param.get('reference_range', '')
                        }
                    
                    st.markdown("---")
                    
                    # Custom panel specific fields (if applicable)
                    if selected_test.get('isCustomPanel'):
                        st.markdown("#### 📋 Custom Panel Information")
                        
                        custom_col1, custom_col2 = st.columns(2)
                        
                        with custom_col1:
                            collection_date = st.date_input(
                                "Collection Date",
                                value=selected_test.get('collectionDate', datetime.now().date())
                            )
                            collection_time = st.time_input(
                                "Collection Time",
                                value=selected_test.get('collectionTime', datetime.now().time())
                            )
                            testing_date = st.date_input(
                                "Testing Date",
                                value=selected_test.get('testingDate', datetime.now().date())
                            )
                        
                        with custom_col2:
                            testing_time = st.time_input(
                                "Testing Time",
                                value=selected_test.get('testingTime', datetime.now().time())
                            )
                            test_method = st.text_input(
                                "Test Method",
                                value=selected_test.get('testMethod', '')
                            )
                            sample_type = st.text_input(
                                "Sample Type",
                                value=selected_test.get('sampleType', '')
                            )
                        
                        st.markdown("---")
                    
                    # Additional result information
                    col_left, col_right = st.columns(2)
                    
                    with col_left:
                        overall_status = st.selectbox(
                            "Overall Status",
                            ["Normal", "Abnormal", "Critical", "Inconclusive"]
                        )
                        
                        performed_by = st.text_input(
                            "Performed By",
                            value=st.session_state.get('user_name', 'Lab Technician')
                        )
                    
                    with col_right:
                        interpretation = st.text_area(
                            "Interpretation",
                            placeholder="Enter clinical interpretation..."
                        )
                        
                        recommendations = st.text_area(
                            "Recommendations", 
                            placeholder="Enter recommendations..."
                        )
                    
                    # Technical details
                    with st.expander("🔧 Technical Details", expanded=False):
                        tech_col1, tech_col2 = st.columns(2)
                        
                        with tech_col1:
                            instrument_id = st.text_input("Instrument ID")
                            run_number = st.text_input("Run Number")
                            method = st.text_input("Method")
                        
                        with tech_col2:
                            temperature = st.number_input("Temperature (°C)", value=22.0)
                            humidity = st.number_input("Humidity (%)", value=45.0)
                            technical_comments = st.text_area("Technical Comments")
                    
                    # Submit results
                    col_submit1, col_submit2, col_submit3 = st.columns(3)
                    
                    with col_submit1:
                        save_draft = st.form_submit_button("💾 Save as Draft", type="secondary")
                    
                    with col_submit2:
                        submit_review = st.form_submit_button("📋 Submit for Review", type="primary")
                    
                    with col_submit3:
                        approve_final = st.form_submit_button("✅ Approve & Finalize")
                    
                    # Handle form submission
                    if save_draft or submit_review or approve_final:
                        result_data = {
                            "test": selected_test['testId'],
                            "patient": selected_test['patientId'],
                            "testValues": list(results_data.values()),
                            "overallStatus": overall_status.lower(),
                            "interpretation": interpretation,
                            "recommendations": recommendations,
                            "performedBy": performed_by,
                            "instrumentData": {
                                "instrumentId": instrument_id,
                                "runNumber": run_number,
                                "temperature": temperature,
                                "humidity": humidity
                            },
                            "technicalComments": technical_comments,
                            "status": "draft" if save_draft else ("pending_review" if submit_review else "approved")
                        }
                        
                        # Add custom panel specific data if applicable
                        if selected_test.get('isCustomPanel'):
                            result_data.update({
                                "customPanelData": {
                                    "collectionDate": collection_date.isoformat() if 'collection_date' in locals() else None,
                                    "collectionTime": collection_time.isoformat() if 'collection_time' in locals() else None,
                                    "testingDate": testing_date.isoformat() if 'testing_date' in locals() else None,
                                    "testingTime": testing_time.isoformat() if 'testing_time' in locals() else None,
                                    "testMethod": test_method if 'test_method' in locals() else None,
                                    "sampleType": sample_type if 'sample_type' in locals() else None,
                                    "authorizationDate": datetime.now().date().isoformat() if approve_final else None,
                                    "authorizationTime": datetime.now().time().isoformat() if approve_final else None
                                }
                            })
                        
                        # In production, this would be sent to the backend API
                        if self.save_test_results(result_data):
                            if save_draft:
                                st.success("✅ Results saved as draft!")
                            elif submit_review:
                                st.success("✅ Results submitted for review!")
                            else:
                                st.success("✅ Results approved and finalized!")
                                if selected_test.get('isCustomPanel'):
                                    st.info(f"🕒 Authorization Date/Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
                            
                            # Update test status
                            selected_test['status'] = 'completed'
                            st.rerun()
                        else:
                            st.error("❌ Failed to save results. Please try again.")
            else:
                st.info("👈 Please select a test from the left panel to enter results")
    
    def get_test_parameters(self, test_type, selected_test=None):
        """Get test parameters based on test type"""
        
        # Check if this is a custom test panel
        if selected_test and selected_test.get('isCustomPanel') and 'parameters' in selected_test:
            # Convert custom panel parameters to the expected format
            custom_parameters = []
            for param in selected_test['parameters']:
                custom_param = {
                    'key': param['name'].lower().replace(' ', '_'),
                    'name': param['name'],
                    'unit': param.get('unit', ''),
                    'reference_range': param.get('reference_range', ''),
                    'critical_values': param.get('critical_values', ''),
                    'format': '%.2f'  # Default format
                }
                custom_parameters.append(custom_param)
            return custom_parameters
        
        # Standard test parameters
        parameters_map = {
            'complete_blood_count': [
                {'key': 'wbc', 'name': 'White Blood Cells', 'unit': '10³/μL', 'reference_range': '4.0-11.0', 'format': '%.1f'},
                {'key': 'rbc', 'name': 'Red Blood Cells', 'unit': '10⁶/μL', 'reference_range': '4.2-5.4', 'format': '%.2f'},
                {'key': 'hemoglobin', 'name': 'Hemoglobin', 'unit': 'g/dL', 'reference_range': '12.0-16.0', 'format': '%.1f'},
                {'key': 'hematocrit', 'name': 'Hematocrit', 'unit': '%', 'reference_range': '36-46', 'format': '%.1f'},
                {'key': 'platelets', 'name': 'Platelets', 'unit': '10³/μL', 'reference_range': '150-450', 'format': '%.0f'}
            ],
            'basic_metabolic_panel': [
                {'key': 'glucose', 'name': 'Glucose', 'unit': 'mg/dL', 'reference_range': '70-100', 'format': '%.0f'},
                {'key': 'bun', 'name': 'BUN', 'unit': 'mg/dL', 'reference_range': '7-20', 'format': '%.0f'},
                {'key': 'creatinine', 'name': 'Creatinine', 'unit': 'mg/dL', 'reference_range': '0.6-1.2', 'format': '%.2f'},
                {'key': 'sodium', 'name': 'Sodium', 'unit': 'mEq/L', 'reference_range': '136-145', 'format': '%.0f'},
                {'key': 'potassium', 'name': 'Potassium', 'unit': 'mEq/L', 'reference_range': '3.5-5.0', 'format': '%.1f'},
                {'key': 'chloride', 'name': 'Chloride', 'unit': 'mEq/L', 'reference_range': '98-107', 'format': '%.0f'},
                {'key': 'co2', 'name': 'CO2', 'unit': 'mEq/L', 'reference_range': '22-29', 'format': '%.0f'}
            ],
            'urinalysis': [
                {'key': 'color', 'name': 'Color', 'unit': '', 'reference_range': 'Yellow', 'format': '%s'},
                {'key': 'clarity', 'name': 'Clarity', 'unit': '', 'reference_range': 'Clear', 'format': '%s'},
                {'key': 'specific_gravity', 'name': 'Specific Gravity', 'unit': '', 'reference_range': '1.003-1.030', 'format': '%.3f'},
                {'key': 'ph', 'name': 'pH', 'unit': '', 'reference_range': '5.0-8.0', 'format': '%.1f'},
                {'key': 'protein', 'name': 'Protein', 'unit': 'mg/dL', 'reference_range': 'Negative', 'format': '%.0f'},
                {'key': 'glucose_urine', 'name': 'Glucose', 'unit': 'mg/dL', 'reference_range': 'Negative', 'format': '%.0f'}
            ]
        }
        
        return parameters_map.get(test_type, [
            {'key': 'result', 'name': 'Result', 'unit': '', 'reference_range': '', 'format': '%.2f'}
        ])
    
    def save_test_results(self, result_data):
        """Save test results (mock function - in production would call backend API)"""
        try:
            # Mock API call - in production this would be:
            # response = requests.post(f"{API_BASE_URL}/results", json=result_data)
            # return response.status_code == 201
            
            # For demo purposes, just return True
            return True
        except Exception as e:
            st.error(f"Error saving results: {str(e)}")
            return False
    
    def results_page(self):
        """Results and reports interface"""
        st.markdown('<div class="main-header">📊 Results & Reports</div>', unsafe_allow_html=True)
        
        # Results entry form
        with st.expander("➕ Enter Test Results", expanded=False):
            with st.form("results_form"):
                col1, col2 = st.columns(2)
                
                with col1:
                    test_id = st.text_input("Test ID")
                    result_value = st.text_input("Result Value")
                    reference_range = st.text_input("Reference Range")
                    status = st.selectbox("Status", ["Normal", "Abnormal", "Critical"])
                
                with col2:
                    technician = st.text_input("Technician")
                    verified_by = st.text_input("Verified By")
                    comments = st.text_area("Comments")
                
                submitted = st.form_submit_button("Save Results")
                
                if submitted:
                    st.success("✅ Results saved successfully!")
                    st.info("🔄 Connect to backend API to save results")
        
        st.markdown("---")
        
        # Reports generation
        st.markdown("### 📋 Generate Reports")
        
        col1, col2, col3 = st.columns(3)
        
        with col1:
            if st.button("📊 Daily Report", use_container_width=True):
                st.info("📊 Connect to backend API to generate daily report")
        
        with col2:
            if st.button("📈 Weekly Summary", use_container_width=True):
                st.info("📈 Connect to backend API to generate weekly summary")
        
        with col3:
            if st.button("📋 Custom Report", use_container_width=True):
                st.info("📋 Connect to backend API to generate custom report")
        
        st.markdown("---")
        
        # Recent results
        st.markdown("### 🔍 Recent Results")
        st.info("🔄 Connect to backend API to display recent results")
    
    def user_management_page(self):
        """User management interface"""
        st.markdown('<div class="main-header">👤 User Management</div>', unsafe_allow_html=True)
        
        if st.session_state.user_role in ['admin', 'super_admin']:
            # User creation form
            with st.expander("➕ Add New User", expanded=False):
                with st.form("user_form"):
                    col1, col2 = st.columns(2)
                    
                    with col1:
                        first_name = st.text_input("First Name")
                        last_name = st.text_input("Last Name")
                        email = st.text_input("Email")
                        role = st.selectbox("Role", ["lab_technician", "doctor", "admin", "nurse"])
                    
                    with col2:
                        department = st.text_input("Department")
                        phone = st.text_input("Phone")
                        password = st.text_input("Password", type="password")
                        confirm_password = st.text_input("Confirm Password", type="password")
                    
                    submitted = st.form_submit_button("Add User")
                    
                    if submitted:
                        if password == confirm_password:
                            st.success("✅ User added successfully!")
                            st.info("🔄 Connect to backend API to save user")
                        else:
                            st.error("❌ Passwords do not match")
            
            st.markdown("---")
            
            # User list
            st.markdown("### 👥 System Users")
            st.info("🔄 Connect to backend API to display user list")
        else:
            st.warning("⚠️ Access denied. Admin privileges required.")
    
    def settings_page(self):
        """Settings and configuration"""
        st.markdown('<div class="main-header">⚙️ Settings</div>', unsafe_allow_html=True)
        
        # User profile settings
        st.markdown("### 👤 User Profile")
        
        with st.form("profile_form"):
            col1, col2 = st.columns(2)
            
            with col1:
                display_name = st.text_input("Display Name", value=st.session_state.user_name)
                email = st.text_input("Email")
                phone = st.text_input("Phone")
            
            with col2:
                department = st.text_input("Department")
                timezone = st.selectbox("Timezone", ["UTC", "EST", "PST", "GMT"])
                language = st.selectbox("Language", ["English", "Spanish", "French"])
            
            if st.form_submit_button("Update Profile"):
                st.success("✅ Profile updated successfully!")
                st.info("🔄 Connect to backend API to save profile changes")
        
        st.markdown("---")
        
        # System preferences
        st.markdown("### 🔧 Preferences")
        
        col1, col2 = st.columns(2)
        
        with col1:
            st.markdown("#### 🎨 Display")
            theme = st.selectbox("Theme", ["Light", "Dark", "Auto"])
            date_format = st.selectbox("Date Format", ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"])
            
        with col2:
            st.markdown("#### 📧 Notifications")
            email_notifications = st.checkbox("Email Notifications", value=True)
            critical_alerts = st.checkbox("Critical Result Alerts", value=True)
        
        if st.button("💾 Save Preferences"):
            st.success("✅ Preferences saved successfully!")
            st.info("🔄 Connect to backend API to save preferences")
    
    def test_panel_creation_page(self):
        """Test Panel Creation and Management Interface"""
        st.markdown('<div class="main-header">🔬 Test Panel Creation & Management</div>', unsafe_allow_html=True)
        
        # Initialize test panels in session state
        if 'custom_test_panels' not in st.session_state:
            st.session_state.custom_test_panels = []
        
        # Create tabs for different functionalities
        tab1, tab2, tab3 = st.tabs(["➕ Create New Test Panel", "📋 Manage Test Panels", "📊 Test Panel Library"])
        
        with tab1:
            st.markdown("### ➕ Create New Test Panel")
            st.markdown("Define custom test panels that your lab regularly performs.")
            
            # Auto-populate section outside the form
            st.markdown("#### 🔍 Quick Test Selection")
            predefined_tests = self.get_predefined_tests()
            
            col_auto1, col_auto2 = st.columns([3, 1])
            with col_auto1:
                selected_predefined = st.selectbox(
                    "Select from Common Tests (Optional)",
                    ["None"] + list(predefined_tests.keys()),
                    help="Choose a predefined test to auto-populate all fields",
                    key="predefined_test_selector"
                )
            
            with col_auto2:
                if st.button("🔄 Auto-Fill", type="secondary", key="auto_fill_btn"):
                    if selected_predefined != "None":
                        # Store the selected test data in session state
                        st.session_state.auto_fill_data = predefined_tests[selected_predefined]
                        st.session_state.auto_fill_test_name = selected_predefined
                        st.success(f"✅ Auto-populated fields for {selected_predefined}")
                        st.rerun()
            
            # Get auto-fill data from session state
            default_values = st.session_state.get('auto_fill_data', {})
            if default_values:
                st.info(f"📋 Currently showing auto-filled data for: **{st.session_state.get('auto_fill_test_name', 'Unknown Test')}**")
            
            # Add a clear button if auto-fill data exists
            if default_values:
                if st.button("🗑️ Clear Auto-filled Data", type="secondary", key="clear_auto_fill"):
                    if 'auto_fill_data' in st.session_state:
                        del st.session_state.auto_fill_data
                    if 'auto_fill_test_name' in st.session_state:
                        del st.session_state.auto_fill_test_name
                    st.success("✅ Auto-filled data cleared!")
                    st.rerun()
            
            with st.form("create_test_panel"):
                
                # Basic Test Information
                st.markdown("#### 🧪 Basic Test Information")
                col1, col2 = st.columns(2)
                
                with col1:
                    test_name = st.text_input(
                        "Test Name *", 
                        value=default_values.get('test_name', ''),
                        placeholder="e.g., Complete Blood Count, Liver Function Test"
                    )
                    test_code = st.text_input(
                        "Test Code *", 
                        value=default_values.get('test_code', ''),
                        placeholder="e.g., CBC, LFT, BMP"
                    )
                    
                    # Find the index of the default category
                    categories = ["Hematology", "Chemistry", "Microbiology", "Immunology", "Molecular", "Pathology", "Other"]
                    default_category_index = 0
                    if 'category' in default_values:
                        try:
                            default_category_index = categories.index(default_values['category'])
                        except ValueError:
                            default_category_index = 0
                    
                    category = st.selectbox(
                        "Test Category *",
                        categories,
                        index=default_category_index
                    )
                
                with col2:
                    # Find the index of the default sample type
                    sample_types = ["Blood", "Serum", "Plasma", "Urine", "Stool", "CSF", "Sputum", "Swab", "Tissue", "Other"]
                    default_sample_index = 0
                    if 'sample_type' in default_values:
                        try:
                            default_sample_index = sample_types.index(default_values['sample_type'])
                        except ValueError:
                            default_sample_index = 0
                    
                    sample_type = st.selectbox(
                        "Sample Type *",
                        sample_types,
                        index=default_sample_index
                    )
                    sample_volume = st.text_input(
                        "Sample Volume Required",
                        value=default_values.get('sample_volume', ''),
                        placeholder="e.g., 5ml, 2-3ml"
                    )
                    
                    # Find the index of the default container type
                    container_types = ["EDTA Tube", "Plain Tube", "Heparin Tube", "Fluoride Tube", "Sterile Container", "Other"]
                    default_container_index = 0
                    if 'container_type' in default_values:
                        try:
                            default_container_index = container_types.index(default_values['container_type'])
                        except ValueError:
                            default_container_index = 0
                    
                    container_type = st.selectbox(
                        "Container Type",
                        container_types,
                        index=default_container_index
                    )
                
                st.markdown("---")
                
                # Test Method and Parameters
                st.markdown("#### 🔬 Test Method & Parameters")
                
                # Find the index of the default test method
                test_methods = ["Automated Analyzer", "Manual Method", "Microscopy", "Culture", "PCR", "ELISA", "Flow Cytometry", "Other"]
                default_method_index = 0
                if 'test_method' in default_values:
                    try:
                        default_method_index = test_methods.index(default_values['test_method'])
                    except ValueError:
                        default_method_index = 0
                
                test_method = st.selectbox(
                    "Test Method *",
                    test_methods,
                    index=default_method_index
                )
                
                if test_method == "Other":
                    custom_method = st.text_input("Specify Test Method")
                
                # Test Parameters
                st.markdown("##### Test Parameters")
                
                # Auto-populate parameters if available
                default_params = default_values.get('parameters', [])
                default_param_count = len(default_params) if default_params else 1
                
                num_parameters = st.number_input("Number of Parameters", min_value=1, max_value=20, value=default_param_count)
                
                parameters = []
                for i in range(int(num_parameters)):
                    st.markdown(f"**Parameter {i+1}:**")
                    param_col1, param_col2, param_col3, param_col4 = st.columns(4)
                    
                    # Get default values for this parameter if available
                    param_default = default_params[i] if i < len(default_params) else {}
                    
                    with param_col1:
                        param_name = st.text_input(
                            f"Parameter Name", 
                            key=f"param_name_{i}",
                            value=param_default.get('name', '')
                        )
                    with param_col2:
                        param_unit = st.text_input(
                            f"Unit", 
                            key=f"param_unit_{i}",
                            value=param_default.get('unit', '')
                        )
                    with param_col3:
                        param_ref_range = st.text_input(
                            f"Reference Range", 
                            key=f"param_ref_{i}",
                            value=param_default.get('reference_range', '')
                        )
                    with param_col4:
                        param_critical = st.text_input(
                            f"Critical Values", 
                            key=f"param_critical_{i}",
                            value=param_default.get('critical_values', '')
                        )
                    
                    if param_name:
                        parameters.append({
                            'name': param_name,
                            'unit': param_unit,
                            'reference_range': param_ref_range,
                            'critical_values': param_critical
                        })
                
                st.markdown("---")
                
                # Authorization and Quality Control
                st.markdown("#### ✅ Authorization & Quality Control")
                col5, col6 = st.columns(2)
                
                with col5:
                    requires_authorization = st.checkbox("Requires Authorization", value=True)
                    
                    # Find the index of the default authorization level
                    auth_levels = ["Technician", "Senior Technician", "Lab Supervisor", "Pathologist"]
                    default_auth_index = 0
                    if 'authorization_level' in default_values:
                        try:
                            default_auth_index = auth_levels.index(default_values['authorization_level'])
                        except ValueError:
                            default_auth_index = 0
                    
                    authorization_level = st.selectbox(
                        "Authorization Level",
                        auth_levels,
                        index=default_auth_index
                    )
                
                with col6:
                    qc_required = st.checkbox("Quality Control Required", value=default_values.get('qc_required', True))
                    if qc_required:
                        # Find the index of the default QC frequency
                        qc_frequencies = ["Every Batch", "Daily", "Weekly", "Monthly"]
                        default_qc_index = 0
                        if 'qc_frequency' in default_values:
                            try:
                                default_qc_index = qc_frequencies.index(default_values['qc_frequency'])
                            except ValueError:
                                default_qc_index = 0
                        
                        qc_frequency = st.selectbox(
                            "QC Frequency",
                            qc_frequencies,
                            index=default_qc_index
                        )
                
                # Additional Information
                st.markdown("#### 📝 Additional Information")
                clinical_significance = st.text_area(
                    "Clinical Significance",
                    value=default_values.get('clinical_significance', ''),
                    placeholder="Describe what this test is used for..."
                )
                special_instructions = st.text_area(
                    "Special Instructions",
                    value=default_values.get('special_instructions', ''),
                    placeholder="Any special handling or processing instructions..."
                )
                
                # Cost and Billing
                st.markdown("#### 💰 Cost & Billing")
                col7, col8 = st.columns(2)
                
                with col7:
                    test_cost = st.number_input(
                        "Test Cost", 
                        min_value=0.0, 
                        format="%.2f",
                        value=default_values.get('test_cost', 0.0)
                    )
                    billing_code = st.text_input(
                        "Billing/CPT Code",
                        value=default_values.get('billing_code', '')
                    )
                
                with col8:
                    insurance_covered = st.checkbox(
                        "Insurance Covered",
                        value=default_values.get('insurance_covered', False)
                    )
                    priority_levels = st.multiselect(
                        "Available Priority Levels",
                        ["Routine", "Urgent", "STAT"],
                        default=default_values.get('priority_levels', ["Routine"])
                    )
                
                # Submit button
                submitted = st.form_submit_button("🔬 Create Test Panel", type="primary")
                
                if submitted:
                    if test_name and test_code and category and sample_type:
                        new_test_panel = {
                            'id': f"TP_{len(st.session_state.custom_test_panels) + 1:04d}",
                            'test_name': test_name,
                            'test_code': test_code,
                            'category': category,
                            'sample_type': sample_type,
                            'sample_volume': sample_volume,
                            'container_type': container_type,
                            'test_method': test_method,
                            'parameters': parameters,
                            'requires_authorization': requires_authorization,
                            'authorization_level': authorization_level,
                            'qc_required': qc_required,
                            'qc_frequency': qc_frequency if qc_required else None,
                            'clinical_significance': clinical_significance,
                            'special_instructions': special_instructions,
                            'test_cost': test_cost,
                            'billing_code': billing_code,
                            'insurance_covered': insurance_covered,
                            'priority_levels': priority_levels,
                            'created_date': str(datetime.now().date()),
                            'created_time': str(datetime.now().time()),
                            'status': 'active'
                        }
                        
                        st.session_state.custom_test_panels.append(new_test_panel)
                        st.success(f"✅ Test Panel '{test_name}' created successfully!")
                        st.info("📋 Collection & Testing Schedule will be entered during sample processing.")
                        
                        # Clear auto-fill data after successful creation
                        if 'auto_fill_data' in st.session_state:
                            del st.session_state.auto_fill_data
                        if 'auto_fill_test_name' in st.session_state:
                            del st.session_state.auto_fill_test_name
                        
                        st.rerun()
                    else:
                        st.error("❌ Please fill in all required fields marked with *")
        
        with tab2:
            st.markdown("### 📋 Manage Existing Test Panels")
            
            if st.session_state.custom_test_panels:
                # Search and filter
                col_search, col_filter = st.columns(2)
                
                with col_search:
                    search_term = st.text_input("🔍 Search Test Panels", placeholder="Search by name or code...")
                
                with col_filter:
                    category_filter = st.selectbox("Filter by Category", 
                        ["All"] + ["Hematology", "Chemistry", "Microbiology", "Immunology", "Molecular", "Pathology", "Other"])
                
                # Filter test panels
                filtered_panels = st.session_state.custom_test_panels
                
                if search_term:
                    filtered_panels = [panel for panel in filtered_panels if 
                        search_term.lower() in panel['test_name'].lower() or 
                        search_term.lower() in panel['test_code'].lower()]
                
                if category_filter != "All":
                    filtered_panels = [panel for panel in filtered_panels if panel['category'] == category_filter]
                
                # Display test panels
                for i, panel in enumerate(filtered_panels):
                    with st.expander(f"🔬 {panel['test_name']} ({panel['test_code']})", expanded=False):
                        col_info1, col_info2, col_actions = st.columns([2, 2, 1])
                        
                        with col_info1:
                            st.write(f"**Category:** {panel['category']}")
                            st.write(f"**Sample Type:** {panel['sample_type']}")
                            st.write(f"**Method:** {panel['test_method']}")
                            st.write(f"**Parameters:** {len(panel['parameters'])}")
                        
                        with col_info2:
                            st.write(f"**Turnaround:** {panel['turnaround_time']}")
                            st.write(f"**Cost:** ₹{panel['test_cost']:.2f}")
                            st.write(f"**Authorization:** {panel['authorization_level']}")
                            st.write(f"**Status:** {panel['status'].title()}")
                        
                        with col_actions:
                            if st.button(f"✏️ Edit", key=f"edit_{panel['id']}"):
                                st.info("Edit functionality - Coming soon!")
                            
                            if st.button(f"🗑️ Delete", key=f"delete_{panel['id']}"):
                                st.session_state.custom_test_panels.remove(panel)
                                st.success(f"Deleted {panel['test_name']}")
                                st.rerun()
                            
                            status_toggle = "Deactivate" if panel['status'] == 'active' else "Activate"
                            if st.button(f"🔄 {status_toggle}", key=f"toggle_{panel['id']}"):
                                panel['status'] = 'inactive' if panel['status'] == 'active' else 'active'
                                st.success(f"{status_toggle}d {panel['test_name']}")
                                st.rerun()
            else:
                st.info("📝 No test panels created yet. Use the 'Create New Test Panel' tab to add your first test.")
        
        with tab3:
            st.markdown("### 📊 Test Panel Library & Statistics")
            
            if st.session_state.custom_test_panels:
                # Statistics
                total_panels = len(st.session_state.custom_test_panels)
                active_panels = len([p for p in st.session_state.custom_test_panels if p['status'] == 'active'])
                
                col_stat1, col_stat2, col_stat3, col_stat4 = st.columns(4)
                
                with col_stat1:
                    st.metric("Total Test Panels", total_panels)
                
                with col_stat2:
                    st.metric("Active Panels", active_panels)
                
                with col_stat3:
                    categories = [p['category'] for p in st.session_state.custom_test_panels]
                    most_common = max(set(categories), key=categories.count) if categories else "N/A"
                    st.metric("Most Common Category", most_common)
                
                with col_stat4:
                    avg_cost = sum([p['test_cost'] for p in st.session_state.custom_test_panels]) / total_panels
                    st.metric("Average Cost", f"₹{avg_cost:.2f}")
                
                st.markdown("---")
                
                # Export/Import functionality
                st.markdown("#### 📤 Export/Import Test Panels")
                
                col_export, col_import = st.columns(2)
                
                with col_export:
                    if st.button("📤 Export Test Panels", use_container_width=True):
                        import json
                        export_data = json.dumps(st.session_state.custom_test_panels, indent=2)
                        st.download_button(
                            label="💾 Download JSON File",
                            data=export_data,
                            file_name=f"test_panels_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json",
                            mime="application/json"
                        )
                
                with col_import:
                    uploaded_file = st.file_uploader("📤 Import Test Panels", type=['json'])
                    if uploaded_file is not None:
                        try:
                            import json
                            imported_data = json.load(uploaded_file)
                            if st.button("✅ Confirm Import"):
                                st.session_state.custom_test_panels.extend(imported_data)
                                st.success(f"✅ Imported {len(imported_data)} test panels!")
                                st.rerun()
                        except Exception as e:
                            st.error(f"❌ Error importing file: {str(e)}")
                
                # Quick actions
                st.markdown("#### ⚡ Quick Actions")
                col_quick1, col_quick2, col_quick3 = st.columns(3)
                
                with col_quick1:
                    if st.button("🔬 Add Common Lab Tests", use_container_width=True):
                        self.add_common_test_panels()
                        st.success("✅ Added common lab test panels!")
                        st.rerun()
                
                with col_quick2:
                    if st.button("🧹 Clear All Panels", use_container_width=True):
                        if st.checkbox("⚠️ Confirm deletion of all panels"):
                            st.session_state.custom_test_panels = []
                            st.success("✅ All test panels cleared!")
                            st.rerun()
                
                with col_quick3:
                    if st.button("📋 Generate Report", use_container_width=True):
                        st.info("📊 Test panel report generation - Coming soon!")
            else:
                st.info("📝 No test panels available. Create some test panels first!")
    
    def get_predefined_tests(self):
        """Get predefined test database for auto-population"""
        return {
            'Albumin': {
                'test_name': 'Albumin',
                'test_code': 'ALB',
                'category': 'Chemistry',
                'sample_type': 'Serum',
                'sample_volume': '1ml',
                'container_type': 'Plain Tube',
                'test_method': 'Automated Analyzer',
                'parameters': [
                    {
                        'name': 'Albumin',
                        'unit': 'g/dL',
                        'reference_range': '3.5-5.0',
                        'critical_values': '<2.0 or >6.0'
                    }
                ],
                'authorization_level': 'Lab Technician',
                'qc_frequency': 'Daily',
                'test_cost': 150.00,
                'billing_code': 'NABL-ALB-001',
                'clinical_significance': 'Liver function assessment, protein-energy malnutrition screening, chronic kidney disease monitoring as per Indian guidelines',
                'special_instructions': 'Fasting not required. Avoid hemolysis.'
            },
            'Complete Blood Count': {
                'test_name': 'Complete Blood Count',
                'test_code': 'CBC',
                'category': 'Hematology',
                'sample_type': 'Blood',
                'sample_volume': '3ml',
                'container_type': 'EDTA Tube',
                'test_method': 'Automated Analyzer',
                'parameters': [
                    {'name': 'WBC', 'unit': '10³/μL', 'reference_range': '4.0-11.0', 'critical_values': '<2.0 or >30.0'},
                    {'name': 'RBC', 'unit': '10⁶/μL', 'reference_range': '4.2-5.4', 'critical_values': '<2.5 or >7.0'},
                    {'name': 'Hemoglobin', 'unit': 'g/dL', 'reference_range': '12.0-16.0', 'critical_values': '<7.0 or >20.0'},
                    {'name': 'Hematocrit', 'unit': '%', 'reference_range': '36-46', 'critical_values': '<20 or >60'},
                    {'name': 'Platelets', 'unit': '10³/μL', 'reference_range': '150-450', 'critical_values': '<50 or >1000'}
                ],
                'authorization_level': 'Lab Technician',
                'qc_frequency': 'Daily',
                'test_cost': 300.00,
                'billing_code': 'NABL-CBC-001',
                'clinical_significance': 'Anemia screening (high prevalence in India), infection detection, blood cancer evaluation, nutritional deficiency assessment',
                'special_instructions': 'EDTA tube required. Process within 4 hours.'
            },
            'Basic Metabolic Panel': {
                'test_name': 'Basic Metabolic Panel',
                'test_code': 'BMP',
                'category': 'Chemistry',
                'sample_type': 'Serum',
                'sample_volume': '2ml',
                'container_type': 'Plain Tube',
                'test_method': 'Automated Analyzer',
                'parameters': [
                    {'name': 'Glucose', 'unit': 'mg/dL', 'reference_range': '70-100', 'critical_values': '<40 or >400'},
                    {'name': 'BUN', 'unit': 'mg/dL', 'reference_range': '7-20', 'critical_values': '>100'},
                    {'name': 'Creatinine', 'unit': 'mg/dL', 'reference_range': '0.6-1.2', 'critical_values': '>5.0'},
                    {'name': 'Sodium', 'unit': 'mEq/L', 'reference_range': '136-145', 'critical_values': '<120 or >160'},
                    {'name': 'Potassium', 'unit': 'mEq/L', 'reference_range': '3.5-5.1', 'critical_values': '<2.5 or >6.5'},
                    {'name': 'Chloride', 'unit': 'mEq/L', 'reference_range': '98-107', 'critical_values': '<80 or >120'},
                    {'name': 'CO2', 'unit': 'mEq/L', 'reference_range': '22-29', 'critical_values': '<10 or >40'}
                ],
                'authorization_level': 'Lab Technician',
                'qc_frequency': 'Daily',
                'test_cost': 450.00,
                'billing_code': 'NABL-KFT-001',
                'clinical_significance': 'Chronic kidney disease monitoring (high prevalence in India), diabetes complications, hypertension management, electrolyte imbalance',
                'special_instructions': 'Fasting preferred but not required.'
            },
            'Liver Function Test': {
                'test_name': 'Liver Function Test',
                'test_code': 'LFT',
                'category': 'Chemistry',
                'sample_type': 'Serum',
                'sample_volume': '2ml',
                'container_type': 'Plain Tube',
                'test_method': 'Automated Analyzer',
                'parameters': [
                    {'name': 'ALT', 'unit': 'U/L', 'reference_range': '7-56', 'critical_values': '>300'},
                    {'name': 'AST', 'unit': 'U/L', 'reference_range': '10-40', 'critical_values': '>300'},
                    {'name': 'ALP', 'unit': 'U/L', 'reference_range': '44-147', 'critical_values': '>500'},
                    {'name': 'Total Bilirubin', 'unit': 'mg/dL', 'reference_range': '0.3-1.2', 'critical_values': '>15'},
                    {'name': 'Direct Bilirubin', 'unit': 'mg/dL', 'reference_range': '0.0-0.3', 'critical_values': '>10'},
                    {'name': 'Total Protein', 'unit': 'g/dL', 'reference_range': '6.0-8.3', 'critical_values': '<4.0'},
                    {'name': 'Albumin', 'unit': 'g/dL', 'reference_range': '3.5-5.0', 'critical_values': '<2.0'}
                ],
                'authorization_level': 'Lab Technician',
                'qc_frequency': 'Daily',
                'test_cost': 600.00,
                'billing_code': 'NABL-LFT-001',
                'clinical_significance': 'Hepatitis B/C screening (endemic in India), alcoholic liver disease, drug-induced hepatotoxicity, fatty liver disease assessment',
                'special_instructions': 'Fasting not required. Avoid hemolysis.'
            },
            'Thyroid Function Test': {
                'test_name': 'Thyroid Function Test',
                'test_code': 'TFT',
                'category': 'Chemistry',
                'sample_type': 'Serum',
                'sample_volume': '2ml',
                'container_type': 'Plain Tube',
                'test_method': 'ELISA',
                'parameters': [
                    {'name': 'TSH', 'unit': 'mIU/L', 'reference_range': '0.4-4.0', 'critical_values': '<0.1 or >20'},
                    {'name': 'Free T4', 'unit': 'ng/dL', 'reference_range': '0.8-1.8', 'critical_values': '<0.4 or >4.0'},
                    {'name': 'Free T3', 'unit': 'pg/mL', 'reference_range': '2.3-4.2', 'critical_values': '<1.0 or >8.0'}
                ],
                'authorization_level': 'Senior Lab Technician',
                'qc_frequency': 'Daily',
                'test_cost': 800.00,
                'billing_code': 'NABL-TFT-001',
                'clinical_significance': 'Thyroid disorders screening (iodine deficiency common in India), hypothyroidism in pregnancy, goiter evaluation, metabolic disorders',
                'special_instructions': 'Morning collection preferred. No special preparation required.'
            },
            'Urinalysis': {
                'test_name': 'Urinalysis',
                'test_code': 'UA',
                'category': 'Chemistry',
                'sample_type': 'Urine',
                'sample_volume': '10ml',
                'container_type': 'Sterile Container',
                'test_method': 'Automated Analyzer',
                'parameters': [
                    {'name': 'Specific Gravity', 'unit': '', 'reference_range': '1.003-1.030', 'critical_values': '<1.001 or >1.035'},
                    {'name': 'pH', 'unit': '', 'reference_range': '4.6-8.0', 'critical_values': '<4.0 or >9.0'},
                    {'name': 'Protein', 'unit': 'mg/dL', 'reference_range': 'Negative', 'critical_values': '>300'},
                    {'name': 'Glucose', 'unit': 'mg/dL', 'reference_range': 'Negative', 'critical_values': '>1000'},
                    {'name': 'Ketones', 'unit': 'mg/dL', 'reference_range': 'Negative', 'critical_values': '>80'},
                    {'name': 'Blood', 'unit': '', 'reference_range': 'Negative', 'critical_values': '3+ or 4+'},
                    {'name': 'Leukocyte Esterase', 'unit': '', 'reference_range': 'Negative', 'critical_values': '3+ or 4+'}
                ],
                'authorization_level': 'Lab Technician',
                'qc_frequency': 'Daily',
                'test_cost': 200.00,
                'billing_code': 'NABL-UA-001',
                'clinical_significance': 'Urinary tract infection diagnosis (common in tropical climate), diabetes screening, kidney disease monitoring, pregnancy complications',
                'special_instructions': 'Clean catch midstream urine. Process within 2 hours.'
            },
            'Lipid Panel': {
                'test_name': 'Lipid Panel',
                'test_code': 'LIPID',
                'category': 'Chemistry',
                'sample_type': 'Serum',
                'sample_volume': '2ml',
                'container_type': 'Plain Tube',
                'test_method': 'Automated Analyzer',
                'parameters': [
                    {'name': 'Total Cholesterol', 'unit': 'mg/dL', 'reference_range': '<200', 'critical_values': '>400'},
                    {'name': 'HDL Cholesterol', 'unit': 'mg/dL', 'reference_range': '>40 (M), >50 (F)', 'critical_values': '<20'},
                    {'name': 'LDL Cholesterol', 'unit': 'mg/dL', 'reference_range': '<100', 'critical_values': '>300'},
                    {'name': 'Triglycerides', 'unit': 'mg/dL', 'reference_range': '<150', 'critical_values': '>1000'}
                ],
                'authorization_level': 'Lab Technician',
                'qc_frequency': 'Daily',
                'test_cost': 400.00,
                'billing_code': 'NABL-LIPID-001',
                'clinical_significance': 'Cardiovascular disease risk assessment (rising prevalence in urban India), coronary artery disease screening, metabolic syndrome evaluation',
                'special_instructions': '12-hour fasting required.'
            },
            'HbA1c': {
                'test_name': 'Hemoglobin A1c',
                'test_code': 'HbA1c',
                'category': 'Chemistry',
                'sample_type': 'Blood',
                'sample_volume': '2ml',
                'container_type': 'EDTA Tube',
                'test_method': 'HPLC',
                'parameters': [
                    {'name': 'HbA1c', 'unit': '%', 'reference_range': '<5.7', 'critical_values': '>15'}
                ],
                'authorization_level': 'Lab Technician',
                'qc_frequency': 'Daily',
                'test_cost': 500.00,
                'billing_code': 'NABL-HBA1C-001',
                'clinical_significance': 'Diabetes mellitus monitoring (epidemic in India), long-term glycemic control assessment, diabetic complications screening',
                'special_instructions': 'No fasting required. Stable for 7 days at room temperature.'
            }
        }

    def add_common_test_panels(self):
        """Add common laboratory test panels"""
        from datetime import datetime
        
        common_tests = [
            {
                'id': f"TP_COMMON_001",
                'test_name': 'Complete Blood Count',
                'test_code': 'CBC',
                'category': 'Hematology',
                'sample_type': 'Blood',
                'sample_volume': '3ml',
                'container_type': 'EDTA Tube',
                'test_method': 'Automated Analyzer',
                'parameters': [
                    {'name': 'WBC', 'unit': '10³/μL', 'reference_range': '4.0-11.0', 'critical_values': '<2.0 or >30.0'},
                    {'name': 'RBC', 'unit': '10⁶/μL', 'reference_range': '4.2-5.4', 'critical_values': '<2.5 or >7.0'},
                    {'name': 'Hemoglobin', 'unit': 'g/dL', 'reference_range': '12.0-16.0', 'critical_values': '<7.0 or >20.0'},
                    {'name': 'Hematocrit', 'unit': '%', 'reference_range': '36-46', 'critical_values': '<20 or >60'},
                    {'name': 'Platelets', 'unit': '10³/μL', 'reference_range': '150-450', 'critical_values': '<50 or >1000'}
                ],
                'turnaround_time': 'Same Day',
                'requires_authorization': True,
                'authorization_level': 'Lab Technician',
                'qc_required': True,
                'qc_frequency': 'Daily',
                'test_cost': 300.00,
                'priority_levels': ['Routine', 'Urgent', 'STAT'],
                'status': 'active'
            },
            {
                'id': f"TP_COMMON_002",
                'test_name': 'Basic Metabolic Panel',
                'test_code': 'BMP',
                'category': 'Chemistry',
                'sample_type': 'Serum',
                'sample_volume': '2ml',
                'container_type': 'Plain Tube',
                'test_method': 'Automated Analyzer',
                'parameters': [
                    {'name': 'Glucose', 'unit': 'mg/dL', 'reference_range': '70-100', 'critical_values': '<40 or >400'},
                    {'name': 'BUN', 'unit': 'mg/dL', 'reference_range': '7-20', 'critical_values': '>100'},
                    {'name': 'Creatinine', 'unit': 'mg/dL', 'reference_range': '0.6-1.2', 'critical_values': '>5.0'},
                    {'name': 'Sodium', 'unit': 'mEq/L', 'reference_range': '136-145', 'critical_values': '<120 or >160'},
                    {'name': 'Potassium', 'unit': 'mEq/L', 'reference_range': '3.5-5.0', 'critical_values': '<2.5 or >6.5'}
                ],
                'turnaround_time': 'Same Day',
                'requires_authorization': True,
                'authorization_level': 'Lab Technician',
                'qc_required': True,
                'qc_frequency': 'Daily',
                'test_cost': 450.00,
                'priority_levels': ['Routine', 'Urgent', 'STAT'],
                'status': 'active'
            }
        ]
        
        # Add timestamp and other required fields
        for test in common_tests:
            test.update({
                'collection_date': str(datetime.now().date()),
                'collection_time': str(datetime.now().time()),
                'testing_date': str(datetime.now().date()),
                'testing_time': str(datetime.now().time()),
                'clinical_significance': f"Standard {test['test_name']} for routine health screening",
                'special_instructions': "Standard collection and processing procedures",
                'billing_code': f"{test['test_code']}_001",
                'insurance_covered': True,
                'fasting_required': False,
                'fasting_hours': None,
                'created_date': str(datetime.now().date()),
                'created_time': str(datetime.now().time())
            })
        
        # Add to session state if not already present
        existing_codes = [panel['test_code'] for panel in st.session_state.test_panels]
        if new_panel['test_code'] not in existing_codes:
            st.session_state.test_panels.append(new_panel)