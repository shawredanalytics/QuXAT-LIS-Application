# QuXAT LIS Streamlit Application - Setup Guide

This guide will help you set up and run the QuXAT Laboratory Information System Streamlit application on your Windows system.

## 📋 Prerequisites

Before running the Streamlit application, you need to install Python and the required dependencies.

## 🐍 Step 1: Install Python

### Option A: Download from Python.org (Recommended)

1. **Visit the Python website**
   - Go to [https://www.python.org/downloads/](https://www.python.org/downloads/)
   - Click "Download Python 3.11.x" (latest stable version)

2. **Run the installer**
   - Double-click the downloaded `.exe` file
   - **IMPORTANT**: Check "Add Python to PATH" during installation
   - Click "Install Now"
   - Wait for installation to complete

3. **Verify installation**
   - Open Command Prompt or PowerShell
   - Type: `python --version`
   - You should see something like: `Python 3.11.x`

### Option B: Install from Microsoft Store

1. **Open Microsoft Store**
   - Search for "Python 3.11" or "Python 3.12"
   - Click "Install"

2. **Verify installation**
   - Open Command Prompt or PowerShell
   - Type: `python --version`

## 📦 Step 2: Install Required Packages

1. **Open Command Prompt or PowerShell**
   - Press `Win + R`, type `cmd` or `powershell`, press Enter

2. **Navigate to the project directory**
   ```cmd
   cd "C:\Users\MANIKUMAR\Desktop\QuXAT LIS Module\streamlit_app"
   ```

3. **Install dependencies**
   ```cmd
   pip install -r requirements.txt
   ```
   
   Or install packages individually:
   ```cmd
   pip install streamlit pandas plotly requests numpy
   ```

## 🚀 Step 3: Run the Application

1. **Start the Streamlit application**
   ```cmd
   streamlit run app.py
   ```

2. **Access the application**
   - Your default web browser should automatically open
   - If not, manually navigate to: `http://localhost:8501`

3. **Login to the application**
   - Click "Demo Mode" to explore with sample data
   - Or use actual credentials if backend is running

## 🎯 Demo Mode

The application includes a built-in demo mode that works without a backend:

1. **Click "Demo Mode"** on the login page
2. **Explore all features** with sample data:
   - Dashboard with analytics
   - Patient management
   - Test ordering and tracking
   - Results entry and reporting
   - User management (admin features)
   - System settings

## 🔧 Troubleshooting

### Python Not Found
If you get "Python was not found" error:
1. Reinstall Python with "Add to PATH" checked
2. Restart your command prompt/PowerShell
3. Try `py --version` instead of `python --version`

### pip Not Found
If you get "pip is not recognized" error:
1. Try `python -m pip install streamlit` instead
2. Or `py -m pip install streamlit`

### Port Already in Use
If port 8501 is busy:
```cmd
streamlit run app.py --server.port 8502
```

### Permission Errors
If you get permission errors:
1. Run Command Prompt as Administrator
2. Or use: `pip install --user streamlit pandas plotly requests numpy`

## 🌐 Backend Integration

### With Backend API
If you have the QuXAT LIS backend running:
1. Start the backend server on `http://localhost:3000`
2. Use actual user credentials to login
3. Full API integration will be available

### Without Backend (Demo Mode)
- All features work with sample data
- No API calls are made
- Perfect for testing and demonstration

## 📁 Project Structure

```
streamlit_app/
├── app.py              # Main Streamlit application
├── requirements.txt    # Python dependencies
├── README.md          # Application documentation
├── SETUP_GUIDE.md     # This setup guide
└── .streamlit/        # Streamlit config (optional)
```

## 🔄 Alternative Installation Methods

### Using Virtual Environment (Recommended for Development)

1. **Create virtual environment**
   ```cmd
   python -m venv venv
   ```

2. **Activate virtual environment**
   ```cmd
   # Windows Command Prompt
   venv\Scripts\activate
   
   # Windows PowerShell
   venv\Scripts\Activate.ps1
   ```

3. **Install dependencies**
   ```cmd
   pip install -r requirements.txt
   ```

4. **Run application**
   ```cmd
   streamlit run app.py
   ```

### Using Anaconda/Miniconda

1. **Install Anaconda** from [https://www.anaconda.com/](https://www.anaconda.com/)

2. **Create conda environment**
   ```cmd
   conda create -n quxat-lis python=3.11
   conda activate quxat-lis
   ```

3. **Install packages**
   ```cmd
   pip install streamlit pandas plotly requests numpy
   ```

4. **Run application**
   ```cmd
   streamlit run app.py
   ```

## 🎨 Customization

### Changing the Port
```cmd
streamlit run app.py --server.port 8080
```

### Running on Network
```cmd
streamlit run app.py --server.address 0.0.0.0
```

### Configuration File
Create `.streamlit/config.toml`:
```toml
[server]
port = 8501
address = "0.0.0.0"

[theme]
primaryColor = "#1f77b4"
backgroundColor = "#ffffff"
secondaryBackgroundColor = "#f0f2f6"
textColor = "#262730"
```

## 📞 Support

If you encounter any issues:

1. **Check Python installation**: `python --version`
2. **Check pip installation**: `pip --version`
3. **Verify packages**: `pip list`
4. **Check Streamlit**: `streamlit --version`

### Common Solutions

- **Restart your terminal** after installing Python
- **Use `py` instead of `python`** on some Windows systems
- **Run as Administrator** if you get permission errors
- **Check firewall settings** if the browser doesn't open

## 🎉 Success!

Once everything is set up correctly, you should see:

1. **Terminal output** showing Streamlit is running
2. **Browser automatically opens** to `http://localhost:8501`
3. **QuXAT LIS login page** appears
4. **Demo Mode button** is available for testing

Enjoy exploring the QuXAT Laboratory Information System!

---

**Need Help?** Contact support or check the main README.md for more detailed information about the application features.