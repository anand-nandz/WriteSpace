import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

export default async function generateOTP(email:string): Promise<string>{
    try {
        const otpCode : string = Math.floor(1000 + Math.random() * 9000).toString();

        const transporter = nodemailer.createTransport({
            host : 'smtp.gmail.com',
            port : 587 ,
            secure : false ,
            requireTLS : true,
            auth :{
                user : process.env.USER_EMAIL,
                pass : process.env.USER_PASSWORD
            }
        });

        const mailOptions = {
            from: process.env.USER_EMAIL,
            to: email,
            subject: 'Your Verification Code for WriteSpace',
            html: `
            <div style="font-family: Arial, sans-serif; color: #333;">
              <h2 style="color: #5e9ca0;">Hello,</h2>
              <p>Thank you for signing up with WriteSpace. To complete your registration, please use the following one-time password (OTP):</p>
              <h1 style="color: #333; background: #f4f4f4; padding: 10px; text-align: center; border-radius: 4px;">${otpCode}</h1>
              <p>This code will expire in 10 minutes.</p>
              <p>If you did not request this, please ignore this email.</p>
              <br/>
              <p>Best Regards,<br/>WriteSpace Team</p>
            </div>
          `
        };

        const info = await transporter.sendMail(mailOptions);
        return otpCode
        
    } catch (error) {
        console.error('Error sending email',error);
        throw new Error('Failed to generate and send OTP'); 
    }
}