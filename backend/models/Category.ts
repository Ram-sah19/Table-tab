import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICategory extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  emoji: string;
  sort_order: number;
  created_at: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    emoji: { type: String, default: "" },
    sort_order: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

export const Category: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema);
