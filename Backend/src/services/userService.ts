import { createAccessToken, createRefreshToken } from "../config/jwt.config";
import { ILoginResponse, User, UserRegistrationData, UserSignUpData } from "../interfaces/commonInterface";
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

}

export default UserService;