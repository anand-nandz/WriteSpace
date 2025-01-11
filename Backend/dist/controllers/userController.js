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
const enums_1 = require("../utils/enums/enums");
const httpStatusCode_1 = __importDefault(require("../utils/enums/httpStatusCode"));
const messages_1 = require("../utils/enums/messages");
const customError_1 = require("../utils/customError");
const handleError_1 = require("../utils/handleError");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class UserController {
    constructor(userService, blogService) {
        this.userSignUp = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, email, password, contactinfo } = req.body;
                const { userData, otpExpiry, resendAvailableAt } = yield this.userService.registerUser({
                    name,
                    email,
                    password,
                    contactinfo,
                });
                res.cookie('userSignUp', userData, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: enums_1.OTP_EXPIRY_TIME,
                    sameSite: 'strict'
                });
                res.status(httpStatusCode_1.default.OK).json({
                    message: messages_1.Messages.Auth.OTP_SENT,
                    email,
                    otpExpiry,
                    resendAvailableAt
                });
            }
            catch (error) {
                (0, handleError_1.handleError)(res, error, 'userSignUp');
            }
        });
        this.verifyOTP = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { otp } = req.body;
                const userData = req.cookies.userSignUp;
                if (!userData) {
                    throw new customError_1.CustomError(messages_1.Messages.Auth.SESSION_EXPIRED, httpStatusCode_1.default.BadRequest);
                }
                const newUser = yield this.userService.verifyOTP(userData, otp);
                if (newUser) {
                    res.clearCookie('userSignUp');
                    res.status(httpStatusCode_1.default.CREATED).json({
                        user: newUser,
                        message: messages_1.Messages.Auth.ACCOUNT_CREATED,
                    });
                }
            }
            catch (error) {
                (0, handleError_1.handleError)(res, error, 'verifyOTP');
            }
        });
        this.userLogin = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                const signinResponse = yield this.userService.signIn(email, password);
                res.cookie('refreshToken', signinResponse.refreshToken, {
                    httpOnly: true, secure: process.env.NODE_ENV === 'production',
                    maxAge: 7 * 24 * 60 * 60 * 1000
                });
                res.status(httpStatusCode_1.default.OK).json({
                    token: signinResponse.token,
                    user: signinResponse.user,
                    message: signinResponse.message
                });
            }
            catch (error) {
                (0, handleError_1.handleError)(res, error, 'userLogin');
            }
        });
        this.create_RefreshToken = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const refreshToken = req.cookies.refreshToken;
                if (!refreshToken) {
                    throw new customError_1.CustomError(messages_1.Messages.Auth.NO_REFRESHTOKEN, httpStatusCode_1.default.Unauthorized);
                }
                try {
                    const newAccessToken = yield this.userService.create_RefreshToken(refreshToken);
                    res.status(httpStatusCode_1.default.OK).json({ token: newAccessToken });
                }
                catch (error) {
                    if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                        res.clearCookie('refreshToken');
                        throw new customError_1.CustomError(messages_1.Messages.Auth.REFRESHTOKEN_EXP, httpStatusCode_1.default.Unauthorized);
                    }
                    throw error;
                }
            }
            catch (error) {
                (0, handleError_1.handleError)(res, error, 'CreateRefreshToken');
            }
        });
        this.userLogout = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                res.clearCookie('refreshToken', {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict'
                });
                res.status(httpStatusCode_1.default.OK).json({ message: messages_1.Messages.Auth.LOGOUT_SUCCESS });
            }
            catch (error) {
                (0, handleError_1.handleError)(res, error, 'UserLogout');
            }
        });
        this.getUserProfile = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                if (!userId) {
                    res.status(httpStatusCode_1.default.BadRequest).json({ message: messages_1.Messages.Warning.USER_ID_MISSING });
                    return;
                }
                const profileDetails = yield this.userService.getUserDetails(userId.toString());
                res.status(httpStatusCode_1.default.OK).json(profileDetails);
            }
            catch (error) {
                (0, handleError_1.handleError)(res, error, 'getUserProfile');
            }
        });
        this.updateProfile = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { name, contactinfo } = req.body;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                if (!userId) {
                    res.status(httpStatusCode_1.default.BadRequest).json({ message: messages_1.Messages.Warning.USER_ID_MISSING });
                    return;
                }
                if ((!name && !contactinfo && !req.file) ||
                    (name === '' && contactinfo === '' && !req.file)) {
                    res.status(httpStatusCode_1.default.BadRequest).json({
                        message: 'At least one field (name, contact info, or image) is required'
                    });
                    return;
                }
                const user = yield this.userService.updateProfileService(name, contactinfo, userId, req.file || null);
                res.status(httpStatusCode_1.default.OK).json({ user });
            }
            catch (error) {
                (0, handleError_1.handleError)(res, error, 'updateProfile');
            }
        });
        this.createBlog = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const blogData = req.body;
                const files = Array.isArray(req.files) ? req.files : [];
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                if (!userId) {
                    res.status(httpStatusCode_1.default.BadRequest).json({ message: messages_1.Messages.Warning.USER_ID_MISSING });
                    return;
                }
                if (!files.length) {
                    res.status(httpStatusCode_1.default.BadRequest).json({ message: 'At least one image is required' });
                    return;
                }
                const newBlog = yield this.blogService.addNewBlog(blogData, files, userId);
                res.status(httpStatusCode_1.default.OK).json(newBlog);
            }
            catch (error) {
                (0, handleError_1.handleError)(res, error, 'createBlog');
            }
        });
        this.editBlog = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const blogId = req.params.id;
                console.log(blogId);
                const blogData = req.body;
                const files = Array.isArray(req.files) ? req.files : [];
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                if (!userId) {
                    res.status(httpStatusCode_1.default.BadRequest).json({ message: messages_1.Messages.Warning.USER_ID_MISSING });
                    return;
                }
                if (!blogId) {
                    res.status(httpStatusCode_1.default.BadRequest).json({ message: messages_1.Messages.Warning.BLOG_ID_MISSING });
                    return;
                }
                const editBlog = yield this.blogService.updateBlog(blogId, blogData, files, userId);
                res.status(httpStatusCode_1.default.OK).json({
                    success: true,
                    message: 'Blog updated successfully',
                    data: editBlog
                });
            }
            catch (error) {
                (0, handleError_1.handleError)(res, error, 'editBlog');
            }
        });
        this.displayBlogs = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                if (!userId) {
                    res.status(httpStatusCode_1.default.BadRequest).json({ message: messages_1.Messages.Warning.USER_ID_MISSING });
                    return;
                }
                let page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 3;
                const result = yield this.blogService.getBlogs(userId, page, limit);
                res.status(httpStatusCode_1.default.OK).json({
                    status: 'success',
                    data: {
                        blogs: result.blogs,
                        totalPages: result.totalPages,
                        currentPage: result.currentPage,
                        total: result.total
                    }
                });
            }
            catch (error) {
                (0, handleError_1.handleError)(res, error, 'displayBlogs');
            }
        });
        this.deleteBlog = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { blogId } = req.params;
                const { status } = req.body;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                if (!userId) {
                    res.status(httpStatusCode_1.default.BadRequest).json({ message: messages_1.Messages.Warning.USER_ID_MISSING });
                    return;
                }
                const result = yield this.blogService.deleteBlog(blogId, status, userId);
                res.status(httpStatusCode_1.default.OK).json({
                    success: true,
                    message: 'Blog status updated successfully',
                    data: { blog: result }
                });
            }
            catch (error) {
                (0, handleError_1.handleError)(res, error, 'deleteBlog');
            }
        });
        this.displayAll = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                let page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 3;
                const search = req.query.search || '';
                console.log(search);
                const result = yield this.blogService.getAllBlogs(page, limit, search);
                res.status(httpStatusCode_1.default.OK).json({
                    status: 'success',
                    data: {
                        blogs: result.blogs,
                        totalPages: result.totalPages,
                        currentPage: result.currentPage,
                        total: result.total
                    }
                });
            }
            catch (error) {
                (0, handleError_1.handleError)(res, error, 'displayBlogs');
            }
        });
        this.userService = userService,
            this.blogService = blogService;
    }
    ;
}
exports.default = UserController;
