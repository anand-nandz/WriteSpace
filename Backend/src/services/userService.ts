import { createAccessToken, createRefreshToken } from "../config/jwt.config";
import { BlogCategories, GoogleUserData, ILoginResponse, User, UserRegistrationData, UserSignUpData } from "../interfaces/commonInterface";
import { IUserRepository } from "../interfaces/repositoryInterface/user.Repository.Interface";
import { IUserService } from "../interfaces/serviceInterface/user.Service.Interface";
import { UserDocument } from "../models/userModel";
import { CustomError } from "../utils/customError";
import { OTP_EXPIRY_TIME, RESEND_COOLDOWN } from "../utils/enums/enums";
import HTTP_statusCode from "../utils/enums/httpStatusCode";
import { Messages } from "../utils/enums/messages";
import generateOTP from "../utils/generateOtp";
import bcrypt from 'bcrypt';
import { s3Service } from "./s3Service";
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendEmail } from "../utils/sendEmail";
import { emailTemplates } from "../utils/emailTemplates";
import mongoose from "mongoose";
import { promptApi } from "./geminiApi";
import { validate } from "../utils/promptValidation";

class UserService implements IUserService {
    private userRepository: IUserRepository;

    constructor(userRepository: IUserRepository) {
        this.userRepository = userRepository
    }

    registerUser = async (data: UserRegistrationData): Promise<{
        userData: object;
        otpExpiry: number;
        resendAvailableAt: number;
    }> => {
        try {
            const { name, email, password, contactinfo } = data;

            const existingUser = await this.userRepository.findByEmail(email);
            if (existingUser) {
                throw new CustomError(Messages.Auth.EMAIL_ALREADY_EXISTS, HTTP_statusCode.BadRequest)
            }

            const otpCode = await generateOTP(email);
            if (!otpCode) {
                throw new CustomError(Messages.Auth.FAIL_GENERATE_OTP, HTTP_statusCode.InternalServerError);
            }

            const otpSetTimestamp = Date.now();
            const userData = {
                name,
                email,
                password,
                contactinfo,
                otpCode,
                otpSetTimestamp,
                otpExpiry: otpSetTimestamp + OTP_EXPIRY_TIME,
                resendTimer: otpSetTimestamp + RESEND_COOLDOWN,
            };

            return {
                userData,
                otpExpiry: userData.otpExpiry,
                resendAvailableAt: userData.resendTimer,
            };

        } catch (error) {
            console.error('Error in registerUser', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError(Messages.Auth.USER_REG_FAILED, HTTP_statusCode.InternalServerError);
        }
    };

    verifyOTP = async (userData: UserSignUpData, otp: string): Promise<User> => {
        try {
            const currentTime = Date.now();
            if (currentTime > userData.otpExpiry) {
                throw new CustomError(Messages.Auth.OTP_EXPIRED, HTTP_statusCode.BadRequest);
            }

            if (otp !== userData.otpCode) {
                throw new CustomError(Messages.Auth.INVALID_OTP, HTTP_statusCode.BadRequest);
            }

            const existingUser = await this.userRepository.findByEmail(userData.email);
            if (existingUser) {
                throw new CustomError(Messages.Auth.EMAIL_ALREADY_EXISTS, HTTP_statusCode.NotFound);
            };

            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(userData.password, salt);
            const isActive: boolean = true;

            const newUser = await this.userRepository.create({
                email: userData.email,
                password: hashedPassword,
                name: userData.name,
                contactinfo: userData.contactinfo,
                isActive
            });

            if (!newUser) {
                throw new CustomError(Messages.Auth.USER_REG_FAILED, HTTP_statusCode.InternalServerError);
            }
            return newUser
        } catch (error) {
            console.error('Error in verifyOTP', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError(Messages.Auth.OTP_VERIFY_FAIL, HTTP_statusCode.InternalServerError)
        }
    }


    googleSignup = async ({ email, name, googleId }: GoogleUserData): Promise<object> => {
        try {
            const existingUser = await this.userRepository.findByEmail(email);

            if (existingUser) {
                if (existingUser.isGoogleUser) return { user: existingUser };
                else {
                    throw new CustomError('Email already registered with different method', HTTP_statusCode.InternalServerError);
                }
            }

            const newUser = await this.userRepository.create({
                email,
                googleId,
                name,
                isActive: true,
                isGoogleUser: true,
            });
            return { user: newUser }

        } catch (error) {
            console.error('Error in signup using google', error)
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to SignIn using Google', HTTP_statusCode.InternalServerError)
        }
    }

    authenticateGoogleLogin = async (userData: GoogleUserData): Promise<ILoginResponse> => {
        try {
            const existingUser = await this.userRepository.findByEmail(userData.email);
            let user: UserDocument;
            let isNewUser = false;

            if (existingUser) {
                if (!existingUser.isGoogleUser) {
                    existingUser.isGoogleUser = true;
                    existingUser.googleId = userData.googleId;
                    if (userData.picture) existingUser.image = userData.picture;
                    user = await existingUser.save()
                } else {
                    user = existingUser;
                }
            } else {
                user = await this.userRepository.create({
                    email: userData.email,
                    name: userData.name,
                    googleId: userData.googleId,
                    isGoogleUser: true,
                    image: userData.picture,
                    isActive: true
                });
                isNewUser = true;
            }
            let userWithSignedUrl = user.toObject();
            if (user?.image) {
                try {
                    const signedImageUrl = await s3Service.getFile('write-space/profile/', existingUser?.image);

                    userWithSignedUrl = {
                        ...userWithSignedUrl,
                        image: signedImageUrl
                    };
                } catch (error) {
                    console.error('Error generating signed URL during Google login:', error);
                }
            }
            
            const token = createAccessToken(user._id.toString())
            const refreshToken = createRefreshToken(user._id.toString())

            return {
                user: userWithSignedUrl,
                isNewUser,
                token,
                refreshToken,
                message: 'Google authenticate successfull'
            };

        } catch (error) {
            console.error('Error in Google authentication:', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to authenticate with Google', HTTP_statusCode.InternalServerError);
        }
    }


    handleForgotPassword = async (email: string): Promise<void> => {
        try {
            const user = await this.userRepository.findByEmail(email)
            if (!user) {
                throw new CustomError('User not exists', HTTP_statusCode.NotFound);
            }
            const resetToken = crypto.randomBytes(20).toString('hex');
            const resetTokenExpiry = new Date(Date.now() + 30 * 60 * 1000);

            user.resetPasswordToken = resetToken;
            user.resetPasswordExpires = resetTokenExpiry;
            await user.save();


            const resetUrl = `${process.env.FRONTEND_URL}/forgot-password/${resetToken}`

            await sendEmail(
                email,
                'Password Reset Request',
                emailTemplates.forgotPassword(user.name, resetUrl)
            );
            this.scheduleTokenCleanup(user._id, resetTokenExpiry)
        } catch (error) {
            console.error('Error in handleForgotPassword:', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to process forgot password request', HTTP_statusCode.InternalServerError);
        }
    }

    newPasswordChange = async (token: string, password: string): Promise<void> => {
        try {
            const user = await this.userRepository.findByToken(token);

            if (!user) {
                throw new CustomError('Invalid token', HTTP_statusCode.InternalServerError);
            }
            if (!user.resetPasswordExpires || new Date() > user.resetPasswordExpires) {
                throw new CustomError('Password reset token has expired', HTTP_statusCode.InternalServerError);
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            let updateSuccess = await this.userRepository.UpdatePasswordAndClearToken(user._id, hashedPassword);

            if (!updateSuccess) {
                throw new CustomError('Failed to Update password', HTTP_statusCode.InternalServerError)
            }

            await sendEmail(
                user.email,
                'Password Reset Successful',
                emailTemplates.ResetPasswordSuccess(user.name)
            );

        } catch (error) {
            console.error('Error in newPasswordChange:', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to password', HTTP_statusCode.InternalServerError);
        }
    }

    validateToken = async (token: string): Promise<boolean> => {
        try {
            const user = await this.userRepository.findByToken(token)

            if (!user) {
                throw new CustomError('Invalid token', HTTP_statusCode.InternalServerError);
            }
            if (!user.resetPasswordExpires) {
                throw new CustomError('No reset token expiry date found', HTTP_statusCode.InternalServerError);
            }

            const currentTime = new Date().getTime()
            const tokenExpiry = new Date(user.resetPasswordExpires).getTime();

            if (currentTime > tokenExpiry) {
                await this.userRepository.clearResetToken(user._id)
                return false;
            }
            return true;

        } catch (error) {
            console.error('Error in validateResetToken:', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError((error as Error).message || 'Failed to validate token', HTTP_statusCode.InternalServerError);
        }
    }

    signIn = async (email: string, password: string): Promise<ILoginResponse> => {
        try {
            const existingUser = await this.userRepository.findByEmail(email);
            if (!existingUser) {
                throw new CustomError(Messages.Auth.USER_NOT_FOUND, HTTP_statusCode.NotFound)
            }
            const passwordMatch = await bcrypt.compare(
                password,
                existingUser.password || ''
            )
            if (!passwordMatch) {
                throw new CustomError('Incorrect Password', HTTP_statusCode.Unauthorized)
            }
            if (existingUser.isActive === false) {
                throw new CustomError('Blocked by Admin', HTTP_statusCode.NoAccess)
            }

            let userWithSignedUrl = existingUser.toObject();
            if (existingUser?.image) {
                try {
                    const signedImageUrl = await s3Service.getFile('write-space/profile/', existingUser?.image);

                    userWithSignedUrl = {
                        ...userWithSignedUrl,
                        image: signedImageUrl
                    };
                } catch (error) {
                    console.error('Error generating signed URL during login:', error);
                }
            }
            const token = createAccessToken(existingUser._id.toString());
            const refreshToken = createRefreshToken(existingUser._id.toString());

            return {
                token,
                refreshToken,
                isNewUser: false,
                user: userWithSignedUrl,
                message: 'Succesfully Logged in'
            }


        } catch (error) {
            console.error('Error in signIn', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError(Messages.Auth.LOGIN_FAILED, HTTP_statusCode.InternalServerError)
        }
    };


    create_RefreshToken = async (refreshToken: string): Promise<string> => {
        try {
            const decodedToken = jwt.verify(
                refreshToken,
                process.env.JWT_REFRESH_SECRET_KEY!
            ) as { _id: string }

            const accessToken = createAccessToken(decodedToken._id.toString())
            return accessToken;

        } catch (error) {
            console.error('Error while creatin refreshToken', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to create refresh Token', HTTP_statusCode.InternalServerError);
        }
    }

    getUserDetails = async (userId: string): Promise<UserDocument> => {
        try {
            const user = await this.userRepository.getById(userId.toString());
            if (!user) {
                throw new CustomError(Messages.Auth.USER_NOT_FOUND, HTTP_statusCode.InternalServerError);
            }
            if (user?.image) {
                try {
                    const imageUrl = await s3Service.getFile('write-space/profile/', user?.image);
                    return {
                        ...user.toObject(),
                        image: imageUrl
                    };
                } catch (error) {
                    console.error('Error generating signed URL:', error);
                    return user;
                }
            }
            return user

        } catch (error) {
            console.error('Error in getUserProfileService:', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError((error as Error).message || 'Failed to get profile details', HTTP_statusCode.InternalServerError);
        }
    };

    updateProfileService = async (
        name: string,
        contactinfo: string,
        userId: any,
        files: Express.Multer.File | null
    ): Promise<UserDocument | null> => {
        try {
            const user = await this.userRepository.getById(userId.toString())
            if (!user) {
                throw new CustomError(Messages.Auth.USER_NOT_FOUND, HTTP_statusCode.NotFound)
            }

            const updateData: {
                name?: string;
                contactinfo?: string;
                image?: string;
            } = {};

            if (name && name !== user.name) {
                updateData.name = name;
            }
            if (contactinfo && contactinfo !== user.contactinfo) {
                updateData.contactinfo = contactinfo;
            }

            if (files) {
                try {
                    const imageFileName = await s3Service.uploadToS3(
                        'write-space/profile/',
                        files
                    );
                    updateData.image = imageFileName;
                } catch (error) {
                    console.error('Error uploading to S3:', error);
                    throw new CustomError('Failed to upload image to S3', HTTP_statusCode.InternalServerError);
                }
            }

            if (Object.keys(updateData).length === 0) {
                throw new CustomError('No changes to update', HTTP_statusCode.InternalServerError);
            }

            const updatedUser = await this.userRepository.update(userId, updateData)
            if (!updatedUser) {
                throw new CustomError('Failed to update user', HTTP_statusCode.InternalServerError);
            }
            await updatedUser.save();
            const freshUser = await this.userRepository.getById(userId.toString());
            if (freshUser?.image) {
                try {
                    const imageUrl = await s3Service.getFile('write-space/profile/', freshUser.image);
                    return {
                        ...freshUser.toObject(),
                        image: imageUrl
                    };
                } catch (error) {
                    console.error('Error generating signed URL:', error);
                    return freshUser;
                }
            }

            return freshUser;
        } catch (error) {
            console.error("Error in updateProfileService:", error)
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError("Failed to update profile.", HTTP_statusCode.InternalServerError);
        }
    }


    generatePrompt = async (prompt: string, category: BlogCategories): Promise<string> => {
        try {
            validate(prompt, category);
            const content = await promptApi(prompt, category)
            return content
        } catch (error) {
            console.error('Error while generating Prompt', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to generatePrompt', HTTP_statusCode.InternalServerError);
        }
    }


    private async scheduleTokenCleanup(userId: mongoose.Types.ObjectId, expiryTime: Date): Promise<void> {
        const timeUntilExpiry = new Date(expiryTime).getTime() - Date.now();
        setTimeout(async () => {
            try {
                await this.userRepository.clearResetToken(userId)
            } catch (error) {
                console.error('Error cleaning up expired token:', error);
            }
        }, timeUntilExpiry)
    }

}

export default UserService;