import express from 'express';
import multer from "multer";
import UserController from '../controllers/userController';
import UserService from '../services/userService';
import UserRepository from '../repositories/userRepository';
import { authenticateToken } from '../middlewares/authToken';
import BlogService from '../services/blogService';
import BlogRepository from '../repositories/blogRepository';

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const userRepository = new UserRepository();
const blogRepository =  new BlogRepository()
const userService = new UserService(userRepository);
const blogService = new BlogService(userRepository, blogRepository)
const userController = new UserController(userService, blogService)

const router = express.Router() ;
router.post('/login',userController.userLogin.bind(userController));
router.post('/logout',userController.userLogout.bind(userController));
router.post('/signup',userController.userSignUp.bind(userController));
router.post('/verifyOtp',userController.verifyOTP.bind(userController));

router.post('/refresh-token',userController.create_RefreshToken.bind(userController))

router.post('/forgot-password',userController.forgotPassword.bind(userController))
router.post('/reset-password/:token',userController.changeForgotPassword.bind(userController))
router.get('/validate-reset-token/:token',userController.validateResetToken.bind(userController))

router.get('/profile',authenticateToken,userController.getUserProfile.bind(userController));
router.put('/profile', upload.single("image"), authenticateToken, userController.updateProfile.bind(userController));
router.post('/create-blog', upload.array("images", 2), authenticateToken, userController.createBlog.bind(userController));
router.put('/edit-blog/:id', upload.array("images", 2), authenticateToken, userController.editBlog.bind(userController));
router.get('/blogs',authenticateToken, userController.displayBlogs.bind(userController));
router.patch('/blogs/:blogId/status',authenticateToken, userController.deleteBlog.bind(userController));
router.get('/all-blogs', userController.displayAll.bind(userController));
router.post('/ai-suggestion', userController.generateContent.bind(userController));

export default router
