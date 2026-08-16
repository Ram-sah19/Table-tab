import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFood extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  category_id?: string;
  price: number;
  image_url?: string;
  prep_time: number;
  is_available: boolean;
  is_veg: boolean;
  spice_level: number;
  rating: number;
  calories: number;
  ingredients: string;
  is_special: boolean;
  is_popular: boolean;
  created_at: Date;
}

const FoodSchema = new Schema<IFood>(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    category_id: { type: String, default: null },
    price: { type: Number, required: true, default: 0 },
    image_url: { type: String, default: "" },
    prep_time: { type: Number, default: 15 },
    is_available: { type: Boolean, default: true },
    is_veg: { type: Boolean, default: true },
    spice_level: { type: Number, default: 1 },
    rating: { type: Number, default: 4.5 },
    calories: { type: Number, default: 350 },
    ingredients: { type: String, default: "" },
    is_special: { type: Boolean, default: false },
    is_popular: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

export const Food: Model<IFood> =
  mongoose.models.Food || mongoose.model<IFood>("Food", FoodSchema);
