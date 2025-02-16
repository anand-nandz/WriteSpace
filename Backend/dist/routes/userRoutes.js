"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const userController_1 = __importDefault(require("../controllers/userController"));
const userService_1 = __importDefault(require("../services/userService"));
const userRepository_1 = __importDefault(require("../repositories/userRepository"));
const authToken_1 = require("../middlewares/authToken");
const blogService_1 = __importDefault(require("../services/blogService"));
const blogRepository_1 = __importDefault(require("../repositories/blogRepository"));
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage: storage });
const userRepository = new userRepository_1.default();
const blogRepository = new blogRepository_1.default();
const userService = new userService_1.default(userRepository);
const blogService = new blogService_1.default(userRepository, blogRepository);
const userController = new userController_1.default(userService, blogService);
const router = express_1.default.Router();
router.post('/login', userController.userLogin.bind(userController));
router.post('/logout', userController.userLogout.bind(userController));
router.post('/signup', userController.userSignUp.bind(userController));
router.post('/verifyOtp', userController.verifyOTP.bind(userController));
router.post('/refresh-token', userController.create_RefreshToken.bind(userController));
router.get('/profile', authToken_1.authenticateToken, userController.getUserProfile.bind(userController));
router.put('/profile', upload.single("image"), authToken_1.authenticateToken, userController.updateProfile.bind(userController));
router.post('/create-blog', upload.array("images", 2), authToken_1.authenticateToken, userController.createBlog.bind(userController));
router.put('/edit-blog/:id', upload.array("images", 2), authToken_1.authenticateToken, userController.editBlog.bind(userController));
router.get('/blogs', authToken_1.authenticateToken, userController.displayBlogs.bind(userController));
router.patch('/blogs/:blogId/status', authToken_1.authenticateToken, userController.deleteBlog.bind(userController));
router.get('/all-blogs', userController.displayAll.bind(userController));
exports.default = router;
