import mongoose from "mongoose";
import { IBlogRepository } from "../interfaces/repositoryInterface/blog.Repository.Interface";
import Blog, { BlogDocument } from "../models/blogModel";
import { BaseRepository } from "./baseRepository";
import { BlogWithSignedUrls } from "../interfaces/commonInterface";

class BlogRepository extends BaseRepository<BlogDocument> implements IBlogRepository {
    constructor() {
        super(Blog);
    }

    getBlogs = async (
        userId: mongoose.Types.ObjectId,
        page: number,
        limit: number
    ): Promise<{
        blogs: BlogWithSignedUrls[],
        total: number;
        totalPages: number;
        currentPage: number
    }> => {
        try {
            const skip = (page - 1) * limit;

            const total = await Blog.find().countDocuments({ userId: userId });
            if (total === 0) {
                return {
                    blogs: [],
                    total: 0,
                    totalPages: 0,
                    currentPage: 1
                };
            }
            const totalPages = Math.ceil(total / limit);
            const validPage = Math.min(Math.max(1, page), totalPages);

            const blogs = await Blog.find({ userId: userId })
                .sort({ createdAt: -1 })
                .populate('userId', 'name email image contactinfo')
                .lean<BlogWithSignedUrls[]>();
                
            return {
                blogs,
                total: blogs.length,
                totalPages: 1,
                currentPage: 1
            }



        } catch (error) {
            console.error('Error in getBlogs repository:', error);
            throw error;
        }
    }

    findByIdAndUpdate = async (
        id: string,
        updateData: Partial<BlogDocument>,
        options: { new: boolean }
    ): Promise<BlogDocument | null> => {
        try {
            return await Blog.findByIdAndUpdate(id, updateData, options).exec();
        } catch (error) {
            console.error('Error in findByIdAndUpdate:', error);
            throw error;
        }
    }

    getAllBlogs = async (limit: number, page: number, search?: string): Promise<{
        blogs: Array<BlogWithSignedUrls | Record<string, any>>;
        total: number;
        totalPages: number;
        currentPage: number;
    }> => {
        try {
            const query: any = {};

            if (search && search.trim()) {
                const searchRegex = new RegExp(search.trim(), 'i');
                query['$or'] = [
                    { 'title': searchRegex },
                    { 'category': searchRegex },
                ];
            }
            const skip = (page - 1) * limit;

            const blogs = await Blog.find(query)
                .sort({ createdAt: -1 })
                .populate('userId', 'name email image contactinfo')
                .lean<BlogWithSignedUrls[]>();

            return {
                blogs: blogs,
                total: blogs.length,
                totalPages: 1,
                currentPage: 1
            };

        } catch (error) {
            console.error('Error in getAllBlogs repository:', error);
            throw error;
        }
    }
}
export default BlogRepository;