"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = generateOTP;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function generateOTP(email) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
            const transporter = nodemailer_1.default.createTransport({
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                requireTLS: true,
                auth: {
                    user: process.env.USER_EMAIL,
                    pass: process.env.USER_PASSWORD
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
            const info = yield transporter.sendMail(mailOptions);
            return otpCode;
        }
        catch (error) {
            console.error('Error sending email', error);
            throw new Error('Failed to generate and send OTP');
        }
    });
}
