import mongoose, { Schema, Document, Model } from "mongoose";

export type UserRole = "admin" | "staff";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password_hash: string;
  full_name: string;
  role: UserRole;
  created_at: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password_hash: { type: String, required: true },
    full_name: { type: String, default: "" },
    role: { type: String, enum: ["admin", "staff"], default: "staff" },
    created_at: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
