import mongoose, { Types } from "mongoose";
import { UserDocument } from "../models/userModel";

export interface UserRegistrationData {
    name: string;
    email: string;
    password: string;
    contactinfo: string;
}


export interface IDecodedData {
  name: string;
  email: string;
  picture?: string;
  sub: string
}

export interface GoogleUserData {
  email: string;
  name: string;
  googleId: string;
  picture?: string;
}

export interface UserSignUpData {
    email: string;
    password: string;
    name: string;
    contactinfo: string;
    otpCode: string;
    otpExpiry: number;
    resendTimer: number;
}


export interface User {
    email: string;
    password?: string;
    name: string;
    googleId?: string;
    contactinfo?: string;
    isActive: boolean;
    isGoogleUser: boolean;
    image?: string;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;

}

export interface Blog {
    title: string;
    description: string;
    status: BlogStatus;
    category: BlogCategories;
    imageUrl?: string[];
    userId: Types.ObjectId ; 
    blogId: string; 
    likeCount: number; 
    dislikeCount: number; 
    createdAt: Date;
    updatedAt: Date;
}


export interface ILoginResponse {
    user: UserDocument;
    message: string
    isNewUser: boolean;
    token: string;
    refreshToken: string;
}

  
export enum BlogStatus {
    DRAFT = "Draft",
    PUBLISHED = "Published",
    ARCHIVED = "Archived",
    Blocked = 'Blocked',
    Delete = 'Deleted'

  }

  
  export enum BlogCategories {
    ALL= 'All',
    TECH = "Tech",
    LIFESTYLE= "Lifestyle",
    EDUCATION= "Education",
    HEALTH= "Health",
    TRAVEL= "Travel",
    FOOD= "Food",
    FASHION= "Fashion",
    BUSINESS= "Business",
    FINANCE= "Finance",
    SPORTS= "Sports",
    ENTERTAINMENT= "Entertainment",
    GAMING= "Gaming",
    SCIENCE= "Science",
    NEWS= "News",
    PERSONAL= "Personal",
    DIY= "DIY",
    ART= "Art",
    PHOTOGRAPHY= "Photography",
    PARENTING= "Parenting",
    RELATIONSHIPS= "Relationships",
    SPIRITUALITY= "Spirituality",
    ENVIRONMENT= "Environment",
    HISTORY= "History",
    BOOKS= "Books",
  };

  export interface BlogFormData {
    _id:string,
    title: string;
    description: string;
    category: BlogCategories;
    status: BlogStatus;  
  }
  export interface UserDetails {
    _id: mongoose.Types.ObjectId;
    name: string;
    contactinfo: string;
    image: string;
}
  export interface BlogWithSignedUrls {
    _id: mongoose.Types.ObjectId;
    title: string;
    description: string;
    status: BlogStatus;
    category: BlogCategories;
    imageUrl: string[];
    // userId: mongoose.Types.ObjectId;
    userId: {
      _id: mongoose.Types.ObjectId;
      email: string;
      name: string;
      contactinfo: string;
      image: string;
  }
    blogId: string;
    likeCount: number;
    dislikeCount: number;
    createdAt: Date;
    updatedAt: Date;
}