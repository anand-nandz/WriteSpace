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
const jwt_config_1 = require("../config/jwt.config");
const customError_1 = require("../utils/customError");
const enums_1 = require("../utils/enums/enums");
const httpStatusCode_1 = __importDefault(require("../utils/enums/httpStatusCode"));
const messages_1 = require("../utils/enums/messages");
const generateOtp_1 = __importDefault(require("../utils/generateOtp"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const s3Service_1 = require("./s3Service");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class UserService {
    constructor(userRepository) {
        this.registerUser = (data) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, email, password, contactinfo } = data;
                const otpCode = yield (0, generateOtp_1.default)(email);
                if (!otpCode) {
                    throw new customError_1.CustomError(messages_1.Messages.Auth.FAIL_GENERATE_OTP, httpStatusCode_1.default.InternalServerError);
                }
                const otpSetTimestamp = Date.now();
                const userData = {
                    name,
                    email,
                    password,
                    contactinfo,
                    otpCode,
                    otpSetTimestamp,
                    otpExpiry: otpSetTimestamp + enums_1.OTP_EXPIRY_TIME,
                    resendTimer: otpSetTimestamp + enums_1.RESEND_COOLDOWN,
                };
                return {
                    userData,
                    otpExpiry: userData.otpExpiry,
                    resendAvailableAt: userData.resendTimer,
                };
            }
            catch (error) {
                console.error('Error in registerUser', error);
                if (error instanceof customError_1.CustomError) {
                    throw error;
                }
                throw new customError_1.CustomError(messages_1.Messages.Auth.USER_REG_FAILED, httpStatusCode_1.default.InternalServerError);
            }
        });
        this.verifyOTP = (userData, otp) => __awaiter(this, void 0, void 0, function* () {
            try {
                const currentTime = Date.now();
                if (currentTime > userData.otpExpiry) {
                    throw new customError_1.CustomError(messages_1.Messages.Auth.OTP_EXPIRED, httpStatusCode_1.default.BadRequest);
                }
                if (otp !== userData.otpCode) {
                    throw new customError_1.CustomError(messages_1.Messages.Auth.INVALID_OTP, httpStatusCode_1.default.BadRequest);
                }
                const existingUser = yield this.userRepository.findByEmail(userData.email);
                if (existingUser) {
                    throw new customError_1.CustomError(messages_1.Messages.Auth.EMAIL_ALREADY_EXISTS, httpStatusCode_1.default.NotFound);
                }
                ;
                const salt = yield bcrypt_1.default.genSalt(10);
                const hashedPassword = yield bcrypt_1.default.hash(userData.password, salt);
                const isActive = true;
                const newUser = yield this.userRepository.create({
                    email: userData.email,
                    password: hashedPassword,
                    name: userData.name,
                    contactinfo: userData.contactinfo,
                    isActive
                });
                if (!newUser) {
                    throw new customError_1.CustomError(messages_1.Messages.Auth.USER_REG_FAILED, httpStatusCode_1.default.InternalServerError);
                }
                return newUser;
            }
            catch (error) {
                console.error('Error in verifyOTP', error);
                if (error instanceof customError_1.CustomError) {
                    throw error;
                }
                throw new customError_1.CustomError(messages_1.Messages.Auth.OTP_VERIFY_FAIL, httpStatusCode_1.default.InternalServerError);
            }
        });
        this.signIn = (email, password) => __awaiter(this, void 0, void 0, function* () {
            try {
                const existingUser = yield this.userRepository.findByEmail(email);
                if (!existingUser) {
                    throw new customError_1.CustomError(messages_1.Messages.Auth.USER_NOT_FOUND, httpStatusCode_1.default.NotFound);
                }
                const passwordMatch = yield bcrypt_1.default.compare(password, existingUser.password || '');
                if (!passwordMatch) {
                    throw new customError_1.CustomError('Incorrect Password', httpStatusCode_1.default.Unauthorized);
                }
                if (existingUser.isActive === false) {
                    throw new customError_1.CustomError('Blocked by Admin', httpStatusCode_1.default.NoAccess);
                }
                let userWithSignedUrl = existingUser.toObject();
                if (existingUser === null || existingUser === void 0 ? void 0 : existingUser.image) {
                    try {
                        const signedImageUrl = yield s3Service_1.s3Service.getFile('write-space/profile/', existingUser === null || existingUser === void 0 ? void 0 : existingUser.image);
                        userWithSignedUrl = Object.assign(Object.assign({}, userWithSignedUrl), { image: signedImageUrl });
                    }
                    catch (error) {
                        console.error('Error generating signed URL during login:', error);
                    }
                }
                const token = (0, jwt_config_1.createAccessToken)(existingUser._id.toString());
                const refreshToken = (0, jwt_config_1.createRefreshToken)(existingUser._id.toString());
                return {
                    token,
                    refreshToken,
                    isNewUser: false,
                    user: userWithSignedUrl,
                    message: 'Succesfully Logged in'
                };
            }
            catch (error) {
                console.error('Error in signIn', error);
                if (error instanceof customError_1.CustomError) {
                    throw error;
                }
                throw new customError_1.CustomError(messages_1.Messages.Auth.LOGIN_FAILED, httpStatusCode_1.default.InternalServerError);
            }
        });
        this.create_RefreshToken = (refreshToken) => __awaiter(this, void 0, void 0, function* () {
            try {
                const decodedToken = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_SECRET_KEY);
                const accessToken = (0, jwt_config_1.createAccessToken)(decodedToken._id.toString());
                return accessToken;
            }
            catch (error) {
                console.error('Error while creatin refreshToken', error);
                if (error instanceof customError_1.CustomError) {
                    throw error;
                }
                throw new customError_1.CustomError('Failed to create refresh Token', httpStatusCode_1.default.InternalServerError);
            }
        });
        this.getUserDetails = (userId) => __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield this.userRepository.getById(userId.toString());
                if (!user) {
                    throw new customError_1.CustomError(messages_1.Messages.Auth.USER_NOT_FOUND, httpStatusCode_1.default.InternalServerError);
                }
                if (user === null || user === void 0 ? void 0 : user.image) {
                    try {
                        const imageUrl = yield s3Service_1.s3Service.getFile('write-space/profile/', user === null || user === void 0 ? void 0 : user.image);
                        return Object.assign(Object.assign({}, user.toObject()), { image: imageUrl });
                    }
                    catch (error) {
                        console.error('Error generating signed URL:', error);
                        return user;
                    }
                }
                return user;
            }
            catch (error) {
                console.error('Error in getUserProfileService:', error);
                if (error instanceof customError_1.CustomError) {
                    throw error;
                }
                throw new customError_1.CustomError(error.message || 'Failed to get profile details', httpStatusCode_1.default.InternalServerError);
            }
        });
        this.updateProfileService = (name, contactinfo, userId, files) => __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield this.userRepository.getById(userId.toString());
                if (!user) {
                    throw new customError_1.CustomError(messages_1.Messages.Auth.USER_NOT_FOUND, httpStatusCode_1.default.NotFound);
                }
                const updateData = {};
                if (name && name !== user.name) {
                    updateData.name = name;
                }
                if (contactinfo && contactinfo !== user.contactinfo) {
                    updateData.contactinfo = contactinfo;
                }
                if (files) {
                    try {
                        const imageFileName = yield s3Service_1.s3Service.uploadToS3('write-space/profile/', files);
                        updateData.image = imageFileName;
                    }
                    catch (error) {
                        console.error('Error uploading to S3:', error);
                        throw new customError_1.CustomError('Failed to upload image to S3', httpStatusCode_1.default.InternalServerError);
                    }
                }
                if (Object.keys(updateData).length === 0) {
                    throw new customError_1.CustomError('No changes to update', httpStatusCode_1.default.InternalServerError);
                }
                const updatedUser = yield this.userRepository.update(userId, updateData);
                if (!updatedUser) {
                    throw new customError_1.CustomError('Failed to update user', httpStatusCode_1.default.InternalServerError);
                }
                yield updatedUser.save();
                const freshUser = yield this.userRepository.getById(userId.toString());
                if (freshUser === null || freshUser === void 0 ? void 0 : freshUser.image) {
                    try {
                        const imageUrl = yield s3Service_1.s3Service.getFile('write-space/profile/', freshUser.image);
                        return Object.assign(Object.assign({}, freshUser.toObject()), { image: imageUrl });
                    }
                    catch (error) {
                        console.error('Error generating signed URL:', error);
                        return freshUser;
                    }
                }
                return freshUser;
            }
            catch (error) {
                console.error("Error in updateProfileService:", error);
                if (error instanceof customError_1.CustomError) {
                    throw error;
                }
                throw new customError_1.CustomError("Failed to update profile.", httpStatusCode_1.default.InternalServerError);
            }
        });
        this.userRepository = userRepository;
    }
}
exports.default = UserService;
