import { Request, Response } from "express";
import { IUserService } from "../interfaces/serviceInterface/user.Service.Interface";
import { OTP_EXPIRY_TIME } from "../utils/enums/enums";
import HTTP_statusCode from "../utils/enums/httpStatusCode";
import { Messages } from "../utils/enums/messages";
import { CustomError } from "../utils/customError";
import { handleError } from "../utils/handleError";
import { AuthenticatedRequest } from "../utils/userTypes";
import { IBlogService } from "../interfaces/serviceInterface/blog.Service.Interface";
import mongoose from "mongoose";
import jwt from 'jsonwebtoken';


class UserController {
    private userService: IUserService;
    private blogService: IBlogService;

    constructor(userService: IUserService, blogService: IBlogService) {
        this.userService = userService,
            this.blogService = blogService
    };


    userSignUp = async (req: Request, res: Response): Promise<void> => {
        try {
            const { name, email, password, contactinfo } = req.body;

            const { userData, otpExpiry, resendAvailableAt } = await this.userService.registerUser({
                name,
                email,
                password,
                contactinfo,
            });

            res.cookie('userSignUp', userData, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: OTP_EXPIRY_TIME,
                sameSite: 'strict'
            });

            res.status(HTTP_statusCode.OK).json({
                message: Messages.Auth.OTP_SENT,
                email,
                otpExpiry,
                resendAvailableAt
            })

        } catch (error) {
            handleError(res, error, 'userSignUp')
        }
    };

    verifyOTP = async (req: Request, res: Response): Promise<void> => {
        try {
            const { otp } = req.body;
            const userData = req.cookies.userSignUp;

            if (!userData) {
                throw new CustomError(Messages.Auth.SESSION_EXPIRED, HTTP_statusCode.BadRequest);
            }

            const newUser = await this.userService.verifyOTP(userData, otp);

            if (newUser) {
                res.clearCookie('userSignUp');
                res.status(HTTP_statusCode.CREATED).json({
                    user: newUser,
                    message: Messages.Auth.ACCOUNT_CREATED,
                });
            }

        } catch (error) {
            handleError(res, error, 'verifyOTP')
        }
    };

    

    userLogin = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, password } = req.body;

            const signinResponse = await this.userService.signIn(email, password);
            res.cookie('refreshToken', signinResponse.refreshToken, {
                httpOnly: true, secure: process.env.NODE_ENV === 'production',
                maxAge: 7 * 24 * 60 * 60 * 1000
            })

            res.status(HTTP_statusCode.OK).json({
                token: signinResponse.token,
                user: signinResponse.user,
                message: signinResponse.message
            })


        } catch (error) {
            handleError(res, error, 'userLogin')
        }
    };


    create_RefreshToken = async (req: Request, res: Response): Promise<void> => {
        try {
            const refreshToken = req.cookies.refreshToken;
            
            if (!refreshToken) {
                throw new CustomError(Messages.Auth.NO_REFRESHTOKEN, HTTP_statusCode.Unauthorized);
            }

            try {
                const newAccessToken = await this.userService.create_RefreshToken(refreshToken);
                res.status(HTTP_statusCode.OK).json({ token: newAccessToken });
            } catch (error) {
                if (error instanceof jwt.TokenExpiredError) {
                    res.clearCookie('refreshToken');
                    throw new CustomError(Messages.Auth.REFRESHTOKEN_EXP, HTTP_statusCode.Unauthorized);
                }
                throw error;
            }

        } catch (error) {
            handleError(res, error, 'CreateRefreshToken')
        }
    }

    forgotPassword = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email } = req.body

            if (!email) {
                throw new CustomError(Messages.Warning.EMAIL_REQUIRED, HTTP_statusCode.BadRequest);
            }
            await this.userService.handleForgotPassword(email)
            res.status(HTTP_statusCode.OK).json({ message: Messages.Auth.PASSWORD_RESET_LINK});

        } catch (error) {
            handleError(res, error, 'forgotPassword')
        }
    }

    changeForgotPassword = async (req: Request, res: Response): Promise<void> => {
        const { token } = req.params;
        const { password } = req.body;

        try {
            if (!token) {
                throw new CustomError(Messages.Auth.SESSION_EXPIRED, HTTP_statusCode.BadRequest)
            } else if (!password) {
                throw new CustomError(Messages.Warning.PASSWORD_REQUIRED, HTTP_statusCode.BadRequest)
            }

            await this.userService.newPasswordChange(token, password)
            res.status(HTTP_statusCode.OK).json({ message: Messages.Auth.PASSWORD_RESET_SUCCESS})

        } catch (error) {
            handleError(res, error, 'changePassword')
        }
    }

    validateResetToken = async (req: Request, res: Response): Promise<void> => {
        const { token } = req.params;
        console.log(token);
        
        try {
            if (!token) {
                throw new CustomError(Messages.Warning.TOKEN_NOT_VALID, HTTP_statusCode.BadRequest);
            }
            const isValid = await this.userService.validateToken(token);
            if (isValid) res.status(HTTP_statusCode.OK).json({ isValid });

        } catch (error) {
            res.status(HTTP_statusCode.BadRequest).json({ message: (error as Error).message });
        }
    }


    userLogout = async (req: Request, res: Response): Promise<void> => {
        try {
            res.clearCookie('refreshToken', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            })
            res.status(HTTP_statusCode.OK).json({ message: Messages.Auth.LOGOUT_SUCCESS })
        } catch (error) {
            handleError(res, error, 'UserLogout')
        }
    };

    getUserProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const userId = req.user?._id;
            if (!userId) {
                res.status(HTTP_statusCode.BadRequest).json({ message: Messages.Warning.USER_ID_MISSING });
                return;
            }
            const profileDetails = await this.userService.getUserDetails(userId.toString());

            res.status(HTTP_statusCode.OK).json(profileDetails);

        } catch (error) {
            handleError(res, error, 'getUserProfile')
        }
    };

    updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const { name, contactinfo } = req.body
            const userId = req.user?._id;

            if (!userId) {
                res.status(HTTP_statusCode.BadRequest).json({ message: Messages.Warning.USER_ID_MISSING });
                return;
            }

            if ((!name && !contactinfo && !req.file) ||
                (name === '' && contactinfo === '' && !req.file)) {
                res.status(HTTP_statusCode.BadRequest).json({
                    message: 'At least one field (name, contact info, or image) is required'
                });
                return;
            }

            const user = await this.userService.updateProfileService(name, contactinfo, userId, req.file || null)

            res.status(HTTP_statusCode.OK).json({ user });
        } catch (error) {
            handleError(res, error, 'updateProfile')
        }
    };

    createBlog = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const blogData = req.body
            const files = Array.isArray(req.files) ? req.files : [];
            const userId = req.user?._id as mongoose.Types.ObjectId;

            if (!userId) {
                res.status(HTTP_statusCode.BadRequest).json({ message: Messages.Warning.USER_ID_MISSING });
                return;
            }

            if (!files.length) {
                res.status(HTTP_statusCode.BadRequest).json({ message: 'At least one image is required' });
                return;
            }
            const newBlog = await this.blogService.addNewBlog(blogData, files, userId)
            res.status(HTTP_statusCode.OK).json(newBlog)

        } catch (error) {
            handleError(res, error, 'createBlog')
        }
    }

    editBlog = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const blogId = req.params.id;
            
            const blogData = req.body
            const files = Array.isArray(req.files) ? req.files : [];

            const userId = req.user?._id as mongoose.Types.ObjectId;

            if (!userId) {
                res.status(HTTP_statusCode.BadRequest).json({ message: Messages.Warning.USER_ID_MISSING });
                return;
            }
            if (!blogId) {
                res.status(HTTP_statusCode.BadRequest).json({ message: Messages.Warning.BLOG_ID_MISSING });
                return;
            }

            const editBlog = await this.blogService.updateBlog(blogId, blogData, files, userId)

            res.status(HTTP_statusCode.OK).json({
                success: true,
                message: 'Blog updated successfully',
                data: editBlog
            });

        } catch (error) {
            handleError(res, error, 'editBlog')
        }
    }

    displayBlogs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const userId = req.user?._id as mongoose.Types.ObjectId;
            if (!userId) {
                res.status(HTTP_statusCode.BadRequest).json({ message: Messages.Warning.USER_ID_MISSING });
                return;
            }
            let page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 3

            const result = await this.blogService.getBlogs(userId, page, limit);

            res.status(HTTP_statusCode.OK).json({
                status: 'success',
                data: {
                    blogs: result.blogs,
                    totalPages: result.totalPages,
                    currentPage: result.currentPage,
                    total: result.total
                }
            });
        } catch (error) {
            handleError(res, error, 'displayBlogs')
        }
    }

    deleteBlog = async (req: AuthenticatedRequest, res: Response ): Promise<void> => {
        try {
            const {blogId} = req.params;
            const { status } = req.body;

            const userId = req.user?._id as mongoose.Types.ObjectId;

            if (!userId) {
                res.status(HTTP_statusCode.BadRequest).json({ message: Messages.Warning.USER_ID_MISSING });
                return;
            }

            const result = await this.blogService.deleteBlog(blogId, status, userId);
            res.status(HTTP_statusCode.OK).json({
                success: true,
                message: 'Blog status updated successfully',
                data: { blog: result }
            });
        } catch (error) {
            handleError(res, error, 'deleteBlog')
        }
    }

    displayAll = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {

            let page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 3
            const search = req.query.search as string || '';
            console.log(search);
            
            const result = await this.blogService.getAllBlogs(page, limit, search);

            res.status(HTTP_statusCode.OK).json({
                status: 'success',
                data: {
                    blogs: result.blogs,
                    totalPages: result.totalPages,
                    currentPage: result.currentPage,
                    total: result.total
                }
            });
        } catch (error) {
            handleError(res, error, 'displayBlogs')
        }
    }

    generateContent = async(req: AuthenticatedRequest, res: Response): Promise<void>=>{
        try {
            const data = req.body;
            
            const result = await this.userService.generatePrompt(data.prompt,data.category)  
                  
            res.status(HTTP_statusCode.OK).json({
                success: true,
                message: 'Data got',
                suggestion: result 
            });
        } catch (error) {
            handleError(res, error, 'generateContent')
        }
    }



}

export default UserController;