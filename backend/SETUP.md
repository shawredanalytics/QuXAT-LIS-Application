# QuXAT LIS Backend Setup Guide

## Prerequisites Installation

### 1. Install Node.js and npm

**Option A: Download from Official Website (Recommended)**
1. Visit [https://nodejs.org/](https://nodejs.org/)
2. Download the LTS version (Long Term Support) for Windows
3. Run the installer (.msi file)
4. Follow the installation wizard (accept all default settings)
5. Restart your computer after installation

**Option B: Using Chocolatey (if you have it installed)**
```powershell
choco install nodejs
```

**Option C: Using Winget (Windows Package Manager)**
```powershell
winget install OpenJS.NodeJS
```

### 2. Verify Installation

After installation, open a new PowerShell or Command Prompt window and run:
```bash
node --version
npm --version
```

You should see version numbers like:
```
v18.17.0
9.6.7
```

### 3. Install MongoDB

**Option A: MongoDB Community Server**
1. Visit [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Download MongoDB Community Server for Windows
3. Run the installer and follow the setup wizard
4. Choose "Complete" installation
5. Install MongoDB as a Windows Service
6. Install MongoDB Compass (GUI tool) when prompted

**Option B: MongoDB Atlas (Cloud Database)**
1. Visit [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster
4. Get your connection string
5. Update the `MONGODB_URI` in your `.env` file

### 4. Install Git (if not already installed)
1. Visit [https://git-scm.com/download/win](https://git-scm.com/download/win)
2. Download and install Git for Windows
3. Use default settings during installation

## Project Setup

### 1. Navigate to Backend Directory
```bash
cd "C:\Users\MANIKUMAR\Desktop\QuXAT LIS Module\backend"
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
The `.env` file has already been created. Update the following values as needed:

```env
# Update MongoDB URI if using local MongoDB
MONGODB_URI=mongodb://localhost:27017/quxat_lis

# Or if using MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/quxat_lis

# Update email settings for notifications
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Update laboratory information
LAB_NAME=Your Laboratory Name
LAB_ADDRESS=Your Laboratory Address
LAB_PHONE=Your Phone Number
LAB_EMAIL=your-lab@email.com
```

### 4. Start the Application

**Development Mode (with auto-restart):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

### 5. Verify Installation
Open your browser and visit:
- Health Check: `http://localhost:5000/api/health`

You should see:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2023-12-01T10:00:00.000Z",
  "environment": "development",
  "version": "1.0.0"
}
```

## Troubleshooting

### Node.js Installation Issues

**Error: 'node' is not recognized**
- Restart your terminal/PowerShell after installation
- Check if Node.js is in your PATH environment variable
- Reinstall Node.js with administrator privileges

**Error: Permission denied**
- Run PowerShell as Administrator
- Or use `npm config set prefix` to change npm's default directory

### MongoDB Connection Issues

**Error: MongoNetworkError**
- Ensure MongoDB service is running (Windows Services)
- Check if MongoDB is listening on port 27017
- Verify your connection string in `.env`

**For MongoDB Atlas:**
- Whitelist your IP address in Atlas dashboard
- Ensure correct username/password in connection string
- Check network connectivity

### Port Already in Use

**Error: EADDRINUSE**
- Change the PORT in `.env` file (e.g., PORT=5001)
- Or kill the process using the port:
```bash
netstat -ano | findstr :5000
taskkill /PID <process_id> /F
```

### npm Install Errors

**Error: EACCES or permission errors**
```bash
npm config set registry https://registry.npmjs.org/
npm cache clean --force
npm install
```

**Error: Network timeout**
```bash
npm config set timeout 60000
npm install
```

## Development Tools (Optional)

### 1. Install Nodemon Globally
```bash
npm install -g nodemon
```

### 2. Install MongoDB Compass
- GUI tool for MongoDB management
- Download from [https://www.mongodb.com/products/compass](https://www.mongodb.com/products/compass)

### 3. Install Postman
- API testing tool
- Download from [https://www.postman.com/downloads/](https://www.postman.com/downloads/)

### 4. VS Code Extensions (if using VS Code)
- Node.js Extension Pack
- MongoDB for VS Code
- REST Client
- ESLint
- Prettier

## Next Steps

1. **Install Node.js** following the instructions above
2. **Install MongoDB** (local or use Atlas)
3. **Run `npm install`** to install dependencies
4. **Configure `.env`** file with your settings
5. **Start the server** with `npm run dev`
6. **Test the API** using the health check endpoint
7. **Proceed with frontend development**

## Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Ensure all prerequisites are properly installed
3. Verify environment variables in `.env`
4. Check the console logs for specific error messages
5. Restart your terminal/PowerShell after installing Node.js

For additional help, refer to:
- [Node.js Documentation](https://nodejs.org/docs/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Documentation](https://expressjs.com/)