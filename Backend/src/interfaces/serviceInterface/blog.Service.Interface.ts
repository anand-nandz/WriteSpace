import mongoose from "mongoose";
import { BlogDocument } from "../../models/blogModel";
import { BlogFormData, BlogStatus, BlogWithSignedUrls } from "../commonInterface";

export interface IBlogService{
   
    addNewBlog(
        blogData: BlogFormData, 
        files: Express.Multer.File[], 
        userId: mongoose.Types.ObjectId,
        existingImages?: string,
        deletedImages?: string
    ):Promise<{blog: BlogDocument}>;
    updateBlog(
        blogId: string,
        blogData: BlogFormData, 
        files: Express.Multer.File[], 
        userId: mongoose.Types.ObjectId,
        existingImages?: string,
        deletedImages?: string
    ):Promise< BlogDocument>;
    getBlogs(
        userId: mongoose.Types.ObjectId, limit: number, page: number
    ): Promise<{
        blogs:BlogWithSignedUrls[];
        totalPages: number;
        total: number;
        currentPage: number
    }>;
    getAllBlogs(limit: number, page: number, search : string): Promise<{
        blogs: Array<BlogWithSignedUrls | Record<string, any>>;
        total: number;
        totalPages: number;
        currentPage: number;
    }>;
    deleteBlog(
        blogId: string, status: BlogStatus, userId: mongoose.Types.ObjectId
    ): Promise<BlogDocument>
}