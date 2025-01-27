
export const emailTemplates = {
  
  forgotPassword: (name: string, resetUrl: string) => `
       <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #5e9ca0;">Password Reset Request</h2>
        <p>Dear ${name},</p>
        <p>Please use the following link to reset your password. This link is valid for 30 minutes:</p>
            <a href="${resetUrl}">Reset Password</a>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
        <br/>
        <p>Best Regards,<br/>WriteSpace Team</p>
      </div>
    `
  ,
  ResetPasswordSuccess: (name: string) => `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2 style="color: #5e9ca0;">Password Reset Successful</h2>
      <p>Hi ${name},</p>
      <p>Your password has been successfully changed. You can now log in using your new password.</p>
      <p>If this change was not made by you, please contact our support team immediately to secure your account.</p>
      <br/>
      <p>Best Regards,<br/>WriteSpace Team</p>
    </div>
  `
  ,


};