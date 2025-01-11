import { UserDocument } from "../../models/userModel";
import { ILoginResponse, User, UserRegistrationData, UserSignUpData } from "../commonInterface";

export interface IUserService{
    registerUser(data: UserRegistrationData): Promise<{
        userData: object;
        otpExpiry: number;
        resendAvailableAt: number;
    }>;
    verifyOTP(userData: UserSignUpData, otp: string): Promise<User>;
    signIn(email:string, password:string): Promise<ILoginResponse>;
    getUserDetails(userId: string): Promise<UserDocument>;
    create_RefreshToken(refreshToken: string) : Promise<string>;
    updateProfileService(name: string, contactinfo: string, userId: any, files: Express.Multer.File | null): Promise<UserDocument | null>;

}