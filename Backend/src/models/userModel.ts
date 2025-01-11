import mongoose, { Schema, Document, Model } from 'mongoose';
import { User } from '../interfaces/commonInterface';

export interface UserDocument extends User, Document {
  _id: mongoose.Types.ObjectId;
}

export interface UserModel extends Model<UserDocument> {
  // Add any static methods here if needed
}

const UserSchema = new Schema<UserDocument, UserModel>({
  email: { type: String, required: true, unique: true },
  password: {
    type: String,
    required: function () {
      return !this.isGoogleUser;
    }
  },
  name: { type: String, required: true },
  googleId: { type: String },
  contactinfo: { type: String },
  isActive: { type: Boolean, default: true },
  image: { type: String },
  isGoogleUser: { type: Boolean, default: false },

}, { timestamps: true });

export default mongoose.model<UserDocument, UserModel>('User', UserSchema);