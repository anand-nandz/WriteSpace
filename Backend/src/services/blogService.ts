import mongoose from "mongoose";
import { Blog, BlogCategories, BlogFormData, BlogStatus, BlogWithSignedUrls } from "../interfaces/commonInterface";
import { IBlogRepository } from "../interfaces/repositoryInterface/blog.Repository.Interface";
import { IUserRepository } from "../interfaces/repositoryInterface/user.Repository.Interface";
import { IBlogService } from "../interfaces/serviceInterface/blog.Service.Interface";
import { BlogDocument, BlogUpdateData } from "../models/blogModel";
import { CustomError } from "../utils/customError";
import HTTP_statusCode from "../utils/enums/httpStatusCode";
import { validatePostInput } from "../utils/validation";
import { s3Service } from "./s3Service";

class BlogService implements IBlogService {
    private blogRepository: IBlogRepository;
    private userRepository: IUserRepository;

    constructor(userRepository: IUserRepository, blogRepository: IBlogRepository) {
        this.userRepository = userRepository,
            this.blogRepository = blogRepository
    }

    addNewBlog = async (
        blogData: BlogFormData,
        files: Express.Multer.File[],
        userId: mongoose.Types.ObjectId
    ): Promise<{ blog: BlogDocument }> => {
        try {
            const { title, description, category, status } = blogData

            const validationResult = await validatePostInput({
                title,
                description,
                category,
                status
            });

            if (!validationResult.isValid) {
                throw new CustomError(
                    `Validation failed : ${validationResult.errors?.join(', ')}`,
                    HTTP_statusCode.InternalServerError
                )
            }

            const uploadImages = await Promise.all(
                files.map(async (image) => {
                    return await s3Service.uploadToS3(
                        `write-space/blogs/`,
                        image
                    )
                })
            )
            const generateBlogId = (): string => {
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
            }
            const newBlog = await this.blogRepository.create(blogDatas)

            return { blog: newBlog }

        } catch (error) {
            console.error('Error while creating new blog', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to create new blog', HTTP_statusCode.InternalServerError);
        }
    };

    updateBlog = async (
        blogId: string,
        blogData: BlogFormData,
        files: Express.Multer.File[],
        userId: mongoose.Types.ObjectId,
        existingImages?: string,
        deletedImages?: string
    ): Promise<BlogDocument> => {
        try {

            const { title, description, category, status } = blogData

            const existingBlog = await this.blogRepository.getById(blogId);

            if (!existingBlog) {
                throw new CustomError('Blog not found', HTTP_statusCode.NotFound);
            }
            if (existingBlog.userId.toString() !== userId.toString()) {
                throw new CustomError('Unauthorized to edit this post', HTTP_statusCode.NoAccess);
            }

            const extractFilename = (url: string): string => {
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
                await Promise.all(
                    imagesToDelete.map(async (filename) => {
                        try {
                            const key = `write-space/blogs/${filename}`;
                            await s3Service.deleteFromS3(key);
                        } catch (error) {
                            console.error(`Failed to delete image: ${filename}`, error);
                        }
                    })
                );
            }
            let newUploadUrls: string[] = [];
            if (files && files.length > 0) {
                newUploadUrls = await Promise.all(
                    files.map(async (image) => {
                        const uploadResult = await s3Service.uploadToS3(
                            `write-space/blogs/`,
                            image
                        );
                        return uploadResult.split('/').pop()?.split('?')[0] || '';
                    })
                );
            }
            const finalImages = [...remainingImages, ...newUploadUrls];

            const updateData: BlogUpdateData = {
                ...(title !== undefined && { title }),
                ...(description !== undefined && { description }),
                ...(category !== undefined && { category: category as BlogCategories }),
                ...(status !== undefined && { status: status as BlogStatus }),
                ...(finalImages.length > 0 ? { imageUrl: finalImages } : {}),
                updatedAt: new Date()
            };

            const updatedBlog = await this.blogRepository.findByIdAndUpdate(
                blogId,
                updateData,
                { new: true }
            );

            if (!updatedBlog) {
                throw new CustomError('Failed to update blog', HTTP_statusCode.InternalServerError)
            }
            const blogWithSignedUrls = { ...updatedBlog.toObject() };
            if (updatedBlog.imageUrl && Array.isArray(updatedBlog.imageUrl)) {
                const signedUrls = await Promise.all(
                    updatedBlog.imageUrl.map(async (imageName) => {
                        try {
                            return await s3Service.getFile(
                                `write-space/blogs/`,
                                imageName
                            );
                        } catch (error) {
                            console.error(`Error getting signed URL for image ${imageName}:`, error);
                            return null;
                        }
                    })
                );
                blogWithSignedUrls.imageUrl = signedUrls.filter((url) => url !== null) as string[];
            }

            return blogWithSignedUrls as BlogDocument;

        } catch (error) {
            console.error('Error while updating blog:', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to update blog', HTTP_statusCode.InternalServerError);
        }
    };

    deleteBlog = async (
        blogId: string, status: BlogStatus, userId: mongoose.Types.ObjectId
    ): Promise<BlogDocument> => {
        try {
            const existingBlog = await this.blogRepository.getById(blogId);
            
            if (!existingBlog) {
                throw new CustomError('Blog not found', HTTP_statusCode.NotFound);
            }

            if (existingBlog.userId.toString() !== userId.toString()) {
                throw new CustomError('Unauthorized to delete this blog', HTTP_statusCode.NoAccess);
            }

            const updateData: BlogUpdateData = {
                status: status,
                updatedAt: new Date()
            };
    
            const blog = await this.blogRepository.findByIdAndUpdate(
                blogId,
                updateData,
                { new: true }
            );

            if (!blog) {
                throw new CustomError('Failed to update blog status', HTTP_statusCode.NotFound);
            }            
    
            return blog;


        } catch (error) {
            console.error('Error in deleteBlog service:', error);
            throw new CustomError('Failed to delete blog', HTTP_statusCode.InternalServerError);
        }
    }


    getBlogs = async (
        userId: mongoose.Types.ObjectId,
        limit: number,
        page: number
    ): Promise<{
        blogs: BlogWithSignedUrls[];
        totalPages: number;
        total: number;
        currentPage: number;
    }> => {
        try {
            const result = await this.blogRepository.getBlogs(userId, page, limit);

            const blogsWithSignedUrls = await Promise.all(
                result.blogs.map(async (blog) => {
                    try {
                        let signedImageUrls: string[] = [];

                        if (blog.imageUrl && Array.isArray(blog.imageUrl)) {
                            const signedUrls = await Promise.all(
                                blog.imageUrl.map(async (imageName) => {
                                    try {
                                        return await s3Service.getFile(
                                            `write-space/blogs/`,
                                            imageName
                                        );
                                    } catch (error) {
                                        console.error(`Error getting signed URL for image ${imageName}:`, error);
                                        return null;
                                    }
                                })
                            );

                            signedImageUrls = signedUrls.filter((url) => url !== null) as string[];
                        }
                        let signedUserImageUrl: string | null = null;
                        if (blog.userId?.image) {
                            try {
                                signedUserImageUrl = await s3Service.getFile('write-space/profile/', blog.userId?.image);
                            } catch (error) {
                                console.error('Error generating signed URL during login:', error);
                            }
                        }


                        return {
                            ...blog,
                            imageUrl: signedImageUrls,
                            userId: {
                                ...blog.userId,
                                image: signedUserImageUrl || blog.userId?.image,
                            },
                        };
                    } catch (error) {
                        console.error('Error processing blog:', error);
                        return {
                            ...blog,
                            imageUrl: []
                        };
                    }
                })
            );

            return {
                blogs: blogsWithSignedUrls,
                totalPages: result.totalPages,
                total: result.total,
                currentPage: result.currentPage
            };
        } catch (error) {
            console.error('Error in getBlogs service:', error);
            throw new CustomError('Failed to fetch blogs', HTTP_statusCode.InternalServerError);
        }
    };

    getAllBlogs = async (limit: number, page: number, search: string): Promise<{
        blogs: Array<BlogWithSignedUrls | Record<string, any>>;
        total: number;
        totalPages: number;
        currentPage: number;
    }> => {
        try {
            const result = await this.blogRepository.getAllBlogs(page, limit, search);
            const blogsWithSignedUrls = await Promise.all(
                result.blogs.map(async (blog) => {
                    try {
                        let signedImageUrls: string[] = [];

                        if (blog.imageUrl && Array.isArray(blog.imageUrl)) {
                            const signedUrls = await Promise.all(
                                blog.imageUrl.map(async (imageName) => {
                                    try {
                                        return await s3Service.getFile(
                                            `write-space/blogs/`,
                                            imageName
                                        );
                                    } catch (error) {
                                        console.error(`Error getting signed URL for image ${imageName}:`, error);
                                        return null;
                                    }
                                })
                            );

                            signedImageUrls = signedUrls.filter((url) => url !== null) as string[];
                        }
                        let signedUserImageUrl: string | null = null;
                        if (blog.userId?.image) {
                            try {
                                signedUserImageUrl = await s3Service.getFile('write-space/profile/', blog.userId?.image);
                            } catch (error) {
                                console.error('Error generating signed URL during login:', error);
                            }
                        }
                        return {
                            ...blog,
                            imageUrl: signedImageUrls,
                            userId: {
                                ...blog.userId,
                                image: signedUserImageUrl || blog.userId?.image,
                            },
                        };
                    } catch (error) {
                        console.error('Error processing blog:', error);
                        return {
                            ...blog,
                            imageUrl: []
                        };
                    }
                })
            );

            return {
                blogs: blogsWithSignedUrls,
                totalPages: result.totalPages,
                total: result.total,
                currentPage: result.currentPage
            };
        } catch (error) {
            console.error('Error in getAllBlogs service:', error);
            throw new CustomError('Failed to fetch Allblogs', HTTP_statusCode.InternalServerError);
        }
    }
}
export default BlogService;
