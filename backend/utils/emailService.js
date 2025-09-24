const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendEmail(options) {
    try {
      const mailOptions = {
        from: `${process.env.LAB_NAME} <${process.env.EMAIL_FROM}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        attachments: options.attachments || []
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Email send error:', error);
      return { success: false, error: error.message };
    }
  }

  async sendWelcomeEmail(user, tempPassword) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to ${process.env.LAB_NAME} LIS</h2>
        <p>Dear ${user.firstName} ${user.lastName},</p>
        <p>Your account has been created successfully. Here are your login credentials:</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Temporary Password:</strong> ${tempPassword}</p>
          <p><strong>Role:</strong> ${user.role}</p>
          <p><strong>Department:</strong> ${user.department}</p>
        </div>
        <p style="color: #dc2626;"><strong>Important:</strong> Please change your password after your first login.</p>
        <p>You can access the system at: <a href="${process.env.FRONTEND_URL}">${process.env.FRONTEND_URL}</a></p>
        <p>If you have any questions, please contact the system administrator.</p>
        <p>Best regards,<br>${process.env.LAB_NAME} Team</p>
      </div>
    `;

    return await this.sendEmail({
      to: user.email,
      subject: `Welcome to ${process.env.LAB_NAME} LIS`,
      html
    });
  }

  async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Password Reset Request</h2>
        <p>Dear ${user.firstName} ${user.lastName},</p>
        <p>You have requested to reset your password. Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
        </div>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #6b7280;">${resetUrl}</p>
        <p style="color: #dc2626;"><strong>Note:</strong> This link will expire in 10 minutes.</p>
        <p>If you didn't request this password reset, please ignore this email.</p>
        <p>Best regards,<br>${process.env.LAB_NAME} Team</p>
      </div>
    `;

    return await this.sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      html
    });
  }

  async sendCriticalValueAlert(result, patient, test) {
    const criticalValues = result.testValues.filter(value => 
      value.flags && value.flags.includes('critical')
    );

    const valuesHtml = criticalValues.map(value => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${value.parameter}</td>
        <td style="padding: 8px; border: 1px solid #ddd; color: #dc2626; font-weight: bold;">${value.value} ${value.unit}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${value.referenceRange}</td>
      </tr>
    `).join('');

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">🚨 CRITICAL VALUE ALERT</h2>
        <div style="background-color: #fef2f2; border: 2px solid #dc2626; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #dc2626; margin-top: 0;">Patient Information</h3>
          <p><strong>Name:</strong> ${patient.firstName} ${patient.lastName}</p>
          <p><strong>Patient ID:</strong> ${patient.patientId}</p>
          <p><strong>DOB:</strong> ${new Date(patient.dateOfBirth).toLocaleDateString()}</p>
          <p><strong>Phone:</strong> ${patient.phone}</p>
        </div>
        
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Test Information</h3>
          <p><strong>Test Type:</strong> ${test.testType}</p>
          <p><strong>Test ID:</strong> ${test.testId}</p>
          <p><strong>Sample ID:</strong> ${test.sampleId}</p>
          <p><strong>Priority:</strong> ${test.priority}</p>
        </div>

        <h3 style="color: #dc2626;">Critical Values</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Parameter</th>
              <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Value</th>
              <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Reference Range</th>
            </tr>
          </thead>
          <tbody>
            ${valuesHtml}
          </tbody>
        </table>

        <div style="background-color: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0; color: #92400e;"><strong>Action Required:</strong> Please contact the patient and/or attending physician immediately.</p>
        </div>

        <p><strong>Result ID:</strong> ${result.resultId}</p>
        <p><strong>Performed Date:</strong> ${new Date(result.performedDate).toLocaleString()}</p>
        
        <p>This is an automated alert from ${process.env.LAB_NAME} LIS.</p>
      </div>
    `;

    // Send to multiple recipients (lab manager, attending physician, etc.)
    const recipients = [
      process.env.LAB_MANAGER_EMAIL,
      test.referringPhysician?.email
    ].filter(Boolean);

    const promises = recipients.map(email => 
      this.sendEmail({
        to: email,
        subject: `🚨 CRITICAL VALUE ALERT - ${patient.firstName} ${patient.lastName} (${patient.patientId})`,
        html
      })
    );

    return await Promise.all(promises);
  }

  async sendTestResultNotification(result, patient, test, physician) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Test Results Available</h2>
        <p>Dear Dr. ${physician.firstName} ${physician.lastName},</p>
        <p>Test results are now available for your patient:</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Patient Information</h3>
          <p><strong>Name:</strong> ${patient.firstName} ${patient.lastName}</p>
          <p><strong>Patient ID:</strong> ${patient.patientId}</p>
          <p><strong>DOB:</strong> ${new Date(patient.dateOfBirth).toLocaleDateString()}</p>
        </div>

        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Test Information</h3>
          <p><strong>Test Type:</strong> ${test.testType}</p>
          <p><strong>Test ID:</strong> ${test.testId}</p>
          <p><strong>Result Status:</strong> ${result.overallStatus}</p>
          <p><strong>Reported Date:</strong> ${new Date(result.reportedDate).toLocaleString()}</p>
        </div>

        <p>You can view the complete results by logging into the LIS system:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/results/${result._id}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Results</a>
        </div>

        <p>If you have any questions about these results, please contact our laboratory.</p>
        <p>Best regards,<br>${process.env.LAB_NAME}</p>
      </div>
    `;

    return await this.sendEmail({
      to: physician.email,
      subject: `Test Results Available - ${patient.firstName} ${patient.lastName}`,
      html
    });
  }

  async sendDailyReport(reportData, recipients) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Daily Laboratory Report - ${new Date().toLocaleDateString()}</h2>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0;">
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center;">
            <h3 style="color: #2563eb; margin: 0 0 10px 0;">Tests Ordered</h3>
            <p style="font-size: 2em; font-weight: bold; margin: 0; color: #1f2937;">${reportData.testsOrdered}</p>
          </div>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center;">
            <h3 style="color: #059669; margin: 0 0 10px 0;">Tests Completed</h3>
            <p style="font-size: 2em; font-weight: bold; margin: 0; color: #1f2937;">${reportData.testsCompleted}</p>
          </div>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center;">
            <h3 style="color: #dc2626; margin: 0 0 10px 0;">Critical Values</h3>
            <p style="font-size: 2em; font-weight: bold; margin: 0; color: #1f2937;">${reportData.criticalValues}</p>
          </div>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center;">
            <h3 style="color: #7c3aed; margin: 0 0 10px 0;">New Patients</h3>
            <p style="font-size: 2em; font-weight: bold; margin: 0; color: #1f2937;">${reportData.newPatients}</p>
          </div>
        </div>

        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Pending Items</h3>
          <ul>
            <li>Tests awaiting collection: ${reportData.pendingCollection}</li>
            <li>Tests in processing: ${reportData.inProcessing}</li>
            <li>Results pending review: ${reportData.pendingReview}</li>
            <li>Results pending approval: ${reportData.pendingApproval}</li>
          </ul>
        </div>

        <p>This automated report was generated by ${process.env.LAB_NAME} LIS.</p>
        <p>For detailed reports, please log into the system.</p>
      </div>
    `;

    const promises = recipients.map(email => 
      this.sendEmail({
        to: email,
        subject: `Daily Lab Report - ${new Date().toLocaleDateString()}`,
        html
      })
    );

    return await Promise.all(promises);
  }

  async sendMaintenanceNotification(message, scheduledTime, recipients) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">🔧 System Maintenance Notification</h2>
        <div style="background-color: #fef3c7; border: 1px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #92400e;">${message}</p>
        </div>
        <p><strong>Scheduled Time:</strong> ${new Date(scheduledTime).toLocaleString()}</p>
        <p>Please plan accordingly and save any important work before the maintenance window.</p>
        <p>We apologize for any inconvenience this may cause.</p>
        <p>Best regards,<br>${process.env.LAB_NAME} IT Team</p>
      </div>
    `;

    const promises = recipients.map(email => 
      this.sendEmail({
        to: email,
        subject: 'System Maintenance Notification',
        html
      })
    );

    return await Promise.all(promises);
  }

  async testConnection() {
    try {
      await this.transporter.verify();
      console.log('Email service connection verified');
      return true;
    } catch (error) {
      console.error('Email service connection failed:', error);
      return false;
    }
  }
}

module.exports = new EmailService();