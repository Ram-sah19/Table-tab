import mongoose, { Schema, Document, Model } from "mongoose";

export type ServiceRequestType = "waiter" | "water" | "bill" | "cleaning";
export type ServiceRequestStatus = "open" | "resolved";

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

export const ServiceRequest: Model<IServiceRequest> =
  mongoose.models.ServiceRequest ||
  mongoose.model<IServiceRequest>("ServiceRequest", ServiceRequestSchema);
