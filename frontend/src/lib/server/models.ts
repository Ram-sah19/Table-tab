import mongoose, { Schema, type Document, type Model } from "mongoose";

// --- Types ---
export type OrderStatus = "received" | "confirmed" | "preparing" | "ready" | "served" | "cancelled";
export type ServiceRequestType = "waiter" | "water" | "bill" | "cleaning";
export type ServiceRequestStatus = "open" | "resolved";
export type UserRole = "admin" | "staff";

export interface ICategory extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  emoji: string;
  sort_order: number;
  created_at: Date;
}

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

export interface IOrderItem {
  name: string;
  qty: number;
  price: number;
  options: string[];
  note: string;
}

export interface IOrder extends Document {
  _id: mongoose.Types.ObjectId;
  order_number: number;
  customer_name: string;
  table_number: string;
  items: IOrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  special_instructions: string;
  status: OrderStatus;
  eta_minutes: number;
  created_at: Date;
  updated_at: Date;
}

export interface IServiceRequest extends Document {
  _id: mongoose.Types.ObjectId;
  table_number: string;
  customer_name: string;
  type: ServiceRequestType;
  note: string;
  status: ServiceRequestStatus;
  created_at: Date;
  updated_at: Date;
}

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password_hash: string;
  full_name: string;
  role: UserRole;
  created_at: Date;
}

export interface ICounter extends Document {
  _id: string;
  seq: number;
}

// --- Schemas ---

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

const OrderItemSchema = new Schema<IOrderItem>(
  {
    name: { type: String, required: true },
    qty: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    options: { type: [String], default: [] },
    note: { type: String, default: "" },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    order_number: { type: Number, required: true, unique: true },
    customer_name: { type: String, required: true },
    table_number: { type: String, required: true },
    items: { type: [OrderItemSchema], default: [] },
    subtotal: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    special_instructions: { type: String, default: "" },
    status: {
      type: String,
      enum: ["received", "confirmed", "preparing", "ready", "served", "cancelled"],
      default: "received",
    },
    eta_minutes: { type: Number, default: 20 },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

const ServiceRequestSchema = new Schema<IServiceRequest>(
  {
    table_number: { type: String, required: true },
    customer_name: { type: String, default: "" },
    type: {
      type: String,
      enum: ["waiter", "water", "bill", "cleaning"],
      default: "waiter",
    },
    note: { type: String, default: "" },
    status: {
      type: String,
      enum: ["open", "resolved"],
      default: "open",
    },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

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

const CounterSchema = new Schema<ICounter>(
  {
    _id: { type: String, required: true },
    seq: { type: Number, default: 1000 },
  },
  { versionKey: false }
);

// --- Models (with model caching for hot-reloads) ---

export const Category: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema);

export const Food: Model<IFood> =
  mongoose.models.Food || mongoose.model<IFood>("Food", FoodSchema);

export const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export const ServiceRequest: Model<IServiceRequest> =
  mongoose.models.ServiceRequest ||
  mongoose.model<IServiceRequest>("ServiceRequest", ServiceRequestSchema);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export const Counter: Model<ICounter> =
  mongoose.models.Counter || mongoose.model<ICounter>("Counter", CounterSchema);

export async function getNextOrderNumber(): Promise<number> {
  const counter = await Counter.findByIdAndUpdate(
    "order_number",
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
}
