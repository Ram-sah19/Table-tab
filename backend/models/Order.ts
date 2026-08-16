import mongoose, { Schema, Document, Model } from "mongoose";

export type OrderStatus = "received" | "confirmed" | "preparing" | "ready" | "served" | "cancelled";

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

export const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
