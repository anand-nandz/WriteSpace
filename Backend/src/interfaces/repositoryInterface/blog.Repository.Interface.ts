import mongoose from "mongoose";
import { BlogDocument } from "../../models/blogModel";
import { BlogWithSignedUrls } from "../commonInterface";

export interface IBlogRepository{
    create(data: Partial<BlogDocument>): Promise<BlogDocument>;
    getById(id: string): Promise<BlogDocument | null>; 
    update(id: string, data: Partial<BlogDocument>): Promise<BlogDocument | null>;
    getBlogs(
        userId: mongoose.Types.ObjectId,
        page: number,
        limit: number
    ):Promise <{
        blogs :BlogWithSignedUrls[],
        total: number;
        totalPages: number;
        currentPage: number
    }>;
    findByIdAndUpdate(
        id: string,
        updateData: Partial<BlogDocument>,
        options: { new: boolean }
    ): Promise<BlogDocument | null>; 
    getAllBlogs(limit: number, page: number, search?: string): Promise<{
        blogs: Array<BlogWithSignedUrls | Record<string, any>>;
        total: number;
        totalPages: number;
        currentPage: number;
    }>;
}