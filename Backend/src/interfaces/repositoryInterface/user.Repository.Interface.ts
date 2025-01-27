import mongoose from "mongoose";
import { UserDocument } from "../../models/userModel";

export interface IUserRepository{
    findByEmail(email:string) : Promise< UserDocument | null>;
    create(data: Partial<UserDocument>): Promise<UserDocument>;
    getById(id: string): Promise<UserDocument | null>; 
    update(id: string, data: Partial<UserDocument>): Promise<UserDocument | null>;
    clearResetToken(userId:mongoose.Types.ObjectId) : Promise<void>;
    findByToken(resetPasswordToken:string) : Promise< UserDocument | null>;
    UpdatePasswordAndClearToken(userId:mongoose.Types.ObjectId, hashedPassword:string) : Promise<boolean>;

}