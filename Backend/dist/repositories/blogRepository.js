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
const blogModel_1 = __importDefault(require("../models/blogModel"));
const baseRepository_1 = require("./baseRepository");
class BlogRepository extends baseRepository_1.BaseRepository {
    constructor() {
        super(blogModel_1.default);
        this.getBlogs = (userId, page, limit) => __awaiter(this, void 0, void 0, function* () {
            try {
                const skip = (page - 1) * limit;
                const total = yield blogModel_1.default.find().countDocuments({ userId: userId });
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
                const blogs = yield blogModel_1.default.find({ userId: userId })
                    .sort({ createdAt: -1 })
                    .populate('userId', 'name email image contactinfo')
                    .lean();
                return {
                    blogs,
                    total: blogs.length,
                    totalPages: 1,
                    currentPage: 1
                };
            }
            catch (error) {
                console.error('Error in getBlogs repository:', error);
                throw error;
            }
        });
        this.findByIdAndUpdate = (id, updateData, options) => __awaiter(this, void 0, void 0, function* () {
            try {
                return yield blogModel_1.default.findByIdAndUpdate(id, updateData, options).exec();
            }
            catch (error) {
                console.error('Error in findByIdAndUpdate:', error);
                throw error;
            }
        });
        this.getAllBlogs = (limit, page, search) => __awaiter(this, void 0, void 0, function* () {
            try {
                const query = {};
                if (search && search.trim()) {
                    const searchRegex = new RegExp(search.trim(), 'i');
                    query['$or'] = [
                        { 'title': searchRegex },
                        { 'category': searchRegex },
                    ];
                }
                const skip = (page - 1) * limit;
                const blogs = yield blogModel_1.default.find(query)
                    .sort({ createdAt: -1 })
                    .populate('userId', 'name email image contactinfo')
                    .lean();
                return {
                    blogs: blogs,
                    total: blogs.length,
                    totalPages: 1,
                    currentPage: 1
                };
            }
            catch (error) {
                console.error('Error in getAllBlogs repository:', error);
                throw error;
            }
        });
    }
}
exports.default = BlogRepository;
