import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { Blog, BlogCategories, BlogStatus } from '../interfaces/commonInterface';

export interface BlogDocument extends Blog, Document {
    _id: mongoose.Types.ObjectId;
}
export interface BlogModel extends Model<BlogDocument> {
    // Add static methods here if needed
}

const BlogSchema = new Schema<BlogDocument, BlogModel>(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        status: {
            type: String,
            enum: Object.values(BlogStatus),
            default: BlogStatus.DRAFT,
        },
        category: { 
            type: String,
            enum: Object.values(BlogCategories), 
            required: true },
        imageUrl: { type: [String], required: false },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        blogId: { type: String, unique: true, required: true },
        likeCount: { type: Number, default: 0 },
        dislikeCount: { type: Number, default: 0 },
    },
    { timestamps: true }
);

export interface BlogUpdateData extends Partial<Omit<BlogDocument, 'updatedAt'>> {
    title?: string;
    description?: string;
    category?: BlogCategories;
    status?: BlogStatus;
    imageUrl?: string[];
    updatedAt?: Date;

}

export default mongoose.model<BlogDocument, BlogModel>('Blog', BlogSchema);