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
const customError_1 = require("../utils/customError");
const httpStatusCode_1 = __importDefault(require("../utils/enums/httpStatusCode"));
const validation_1 = require("../utils/validation");
const s3Service_1 = require("./s3Service");
class BlogService {
    constructor(userRepository, blogRepository) {
        this.addNewBlog = (blogData, files, userId) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { title, description, category, status } = blogData;
                const validationResult = yield (0, validation_1.validatePostInput)({
                    title,
                    description,
                    category,
                    status
                });
                if (!validationResult.isValid) {
                    throw new customError_1.CustomError(`Validation failed : ${(_a = validationResult.errors) === null || _a === void 0 ? void 0 : _a.join(', ')}`, httpStatusCode_1.default.InternalServerError);
                }
                const uploadImages = yield Promise.all(files.map((image) => __awaiter(this, void 0, void 0, function* () {
                    return yield s3Service_1.s3Service.uploadToS3(`write-space/blogs/`, image);
                })));
                const generateBlogId = () => {
                    return `ID${Math.random().toString(36).substring(2, 12).toUpperCase()}`;
                };
                const blogId = generateBlogId();
                const blogDatas = {
                    title,
                    description,
                    category,
                    status,
                    imageUrl: uploadImages,
                    userId,
                    blogId: blogId,
                    likeCount: 0,
                    dislikeCount: 0,
                    createdAt: new Date()
                };
                const newBlog = yield this.blogRepository.create(blogDatas);
                return { blog: newBlog };
            }
            catch (error) {
                console.error('Error while creating new blog', error);
                if (error instanceof customError_1.CustomError) {
                    throw error;
                }
                throw new customError_1.CustomError('Failed to create new blog', httpStatusCode_1.default.InternalServerError);
            }
        });
        this.updateBlog = (blogId, blogData, files, userId, existingImages, deletedImages) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { title, description, category, status } = blogData;
                const existingBlog = yield this.blogRepository.getById(blogId);
                if (!existingBlog) {
                    throw new customError_1.CustomError('Blog not found', httpStatusCode_1.default.NotFound);
                }
                if (existingBlog.userId.toString() !== userId.toString()) {
                    throw new customError_1.CustomError('Unauthorized to edit this post', httpStatusCode_1.default.NoAccess);
                }
                const extractFilename = (url) => {
                    const urlWithoutQuery = url.split('?')[0];
                    const parts = urlWithoutQuery.split('blogs/');
                    return parts[parts.length - 1];
                };
                const remainingImages = existingImages
                    ? existingImages.split(',').map(url => extractFilename(url))
                    : [];
                const imagesToDelete = deletedImages
                    ? deletedImages.split(',').map(url => extractFilename(url))
                    : [];
                if (imagesToDelete.length > 0) {
                    yield Promise.all(imagesToDelete.map((filename) => __awaiter(this, void 0, void 0, function* () {
                        try {
                            const key = `write-space/blogs/${filename}`;
                            yield s3Service_1.s3Service.deleteFromS3(key);
                        }
                        catch (error) {
                            console.error(`Failed to delete image: ${filename}`, error);
                        }
                    })));
                }
                let newUploadUrls = [];
                if (files && files.length > 0) {
                    newUploadUrls = yield Promise.all(files.map((image) => __awaiter(this, void 0, void 0, function* () {
                        var _a;
                        const uploadResult = yield s3Service_1.s3Service.uploadToS3(`write-space/blogs/`, image);
                        return ((_a = uploadResult.split('/').pop()) === null || _a === void 0 ? void 0 : _a.split('?')[0]) || '';
                    })));
                }
                const finalImages = [...remainingImages, ...newUploadUrls];
                const updateData = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (title !== undefined && { title })), (description !== undefined && { description })), (category !== undefined && { category: category })), (status !== undefined && { status: status })), (finalImages.length > 0 ? { imageUrl: finalImages } : {})), { updatedAt: new Date() });
                const updatedBlog = yield this.blogRepository.findByIdAndUpdate(blogId, updateData, { new: true });
                if (!updatedBlog) {
                    throw new customError_1.CustomError('Failed to update blog', httpStatusCode_1.default.InternalServerError);
                }
                const blogWithSignedUrls = Object.assign({}, updatedBlog.toObject());
                if (updatedBlog.imageUrl && Array.isArray(updatedBlog.imageUrl)) {
                    const signedUrls = yield Promise.all(updatedBlog.imageUrl.map((imageName) => __awaiter(this, void 0, void 0, function* () {
                        try {
                            return yield s3Service_1.s3Service.getFile(`write-space/blogs/`, imageName);
                        }
                        catch (error) {
                            console.error(`Error getting signed URL for image ${imageName}:`, error);
                            return null;
                        }
                    })));
                    blogWithSignedUrls.imageUrl = signedUrls.filter((url) => url !== null);
                }
                return blogWithSignedUrls;
            }
            catch (error) {
                console.error('Error while updating blog:', error);
                if (error instanceof customError_1.CustomError) {
                    throw error;
                }
                throw new customError_1.CustomError('Failed to update blog', httpStatusCode_1.default.InternalServerError);
            }
        });
        this.deleteBlog = (blogId, status, userId) => __awaiter(this, void 0, void 0, function* () {
            try {
                const existingBlog = yield this.blogRepository.getById(blogId);
                if (!existingBlog) {
                    throw new customError_1.CustomError('Blog not found', httpStatusCode_1.default.NotFound);
                }
                if (existingBlog.userId.toString() !== userId.toString()) {
                    throw new customError_1.CustomError('Unauthorized to delete this blog', httpStatusCode_1.default.NoAccess);
                }
                const updateData = {
                    status: status,
                    updatedAt: new Date()
                };
                const blog = yield this.blogRepository.findByIdAndUpdate(blogId, updateData, { new: true });
                if (!blog) {
                    throw new customError_1.CustomError('Failed to update blog status', httpStatusCode_1.default.NotFound);
                }
                return blog;
            }
            catch (error) {
                console.error('Error in deleteBlog service:', error);
                throw new customError_1.CustomError('Failed to delete blog', httpStatusCode_1.default.InternalServerError);
            }
        });
        this.getBlogs = (userId, limit, page) => __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.blogRepository.getBlogs(userId, page, limit);
                const blogsWithSignedUrls = yield Promise.all(result.blogs.map((blog) => __awaiter(this, void 0, void 0, function* () {
                    var _a, _b, _c;
                    try {
                        let signedImageUrls = [];
                        if (blog.imageUrl && Array.isArray(blog.imageUrl)) {
                            const signedUrls = yield Promise.all(blog.imageUrl.map((imageName) => __awaiter(this, void 0, void 0, function* () {
                                try {
                                    return yield s3Service_1.s3Service.getFile(`write-space/blogs/`, imageName);
                                }
                                catch (error) {
                                    console.error(`Error getting signed URL for image ${imageName}:`, error);
                                    return null;
                                }
                            })));
                            signedImageUrls = signedUrls.filter((url) => url !== null);
                        }
                        let signedUserImageUrl = null;
                        if ((_a = blog.userId) === null || _a === void 0 ? void 0 : _a.image) {
                            try {
                                signedUserImageUrl = yield s3Service_1.s3Service.getFile('write-space/profile/', (_b = blog.userId) === null || _b === void 0 ? void 0 : _b.image);
                            }
                            catch (error) {
                                console.error('Error generating signed URL during login:', error);
                            }
                        }
                        return Object.assign(Object.assign({}, blog), { imageUrl: signedImageUrls, userId: Object.assign(Object.assign({}, blog.userId), { image: signedUserImageUrl || ((_c = blog.userId) === null || _c === void 0 ? void 0 : _c.image) }) });
                    }
                    catch (error) {
                        console.error('Error processing blog:', error);
                        return Object.assign(Object.assign({}, blog), { imageUrl: [] });
                    }
                })));
                return {
                    blogs: blogsWithSignedUrls,
                    totalPages: result.totalPages,
                    total: result.total,
                    currentPage: result.currentPage
                };
            }
            catch (error) {
                console.error('Error in getBlogs service:', error);
                throw new customError_1.CustomError('Failed to fetch blogs', httpStatusCode_1.default.InternalServerError);
            }
        });
        this.getAllBlogs = (limit, page, search) => __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.blogRepository.getAllBlogs(page, limit, search);
                const blogsWithSignedUrls = yield Promise.all(result.blogs.map((blog) => __awaiter(this, void 0, void 0, function* () {
                    var _a, _b, _c;
                    try {
                        let signedImageUrls = [];
                        if (blog.imageUrl && Array.isArray(blog.imageUrl)) {
                            const signedUrls = yield Promise.all(blog.imageUrl.map((imageName) => __awaiter(this, void 0, void 0, function* () {
                                try {
                                    return yield s3Service_1.s3Service.getFile(`write-space/blogs/`, imageName);
                                }
                                catch (error) {
                                    console.error(`Error getting signed URL for image ${imageName}:`, error);
                                    return null;
                                }
                            })));
                            signedImageUrls = signedUrls.filter((url) => url !== null);
                        }
                        let signedUserImageUrl = null;
                        if ((_a = blog.userId) === null || _a === void 0 ? void 0 : _a.image) {
                            try {
                                signedUserImageUrl = yield s3Service_1.s3Service.getFile('write-space/profile/', (_b = blog.userId) === null || _b === void 0 ? void 0 : _b.image);
                            }
                            catch (error) {
                                console.error('Error generating signed URL during login:', error);
                            }
                        }
                        return Object.assign(Object.assign({}, blog), { imageUrl: signedImageUrls, userId: Object.assign(Object.assign({}, blog.userId), { image: signedUserImageUrl || ((_c = blog.userId) === null || _c === void 0 ? void 0 : _c.image) }) });
                    }
                    catch (error) {
                        console.error('Error processing blog:', error);
                        return Object.assign(Object.assign({}, blog), { imageUrl: [] });
                    }
                })));
                return {
                    blogs: blogsWithSignedUrls,
                    totalPages: result.totalPages,
                    total: result.total,
                    currentPage: result.currentPage
                };
            }
            catch (error) {
                console.error('Error in getAllBlogs service:', error);
                throw new customError_1.CustomError('Failed to fetch Allblogs', httpStatusCode_1.default.InternalServerError);
            }
        });
        this.userRepository = userRepository,
            this.blogRepository = blogRepository;
    }
}
exports.default = BlogService;
