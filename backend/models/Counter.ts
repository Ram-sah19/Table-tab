import mongoose, { Schema, Model } from "mongoose";

export interface ICounter {
  _id: string;
  seq: number;
}

const CounterSchema = new Schema<ICounter>(
  {
    _id: { type: String, required: true },
    seq: { type: Number, default: 1000 },
  },
  { versionKey: false }
);

export const Counter: Model<ICounter> =
  mongoose.models.Counter || mongoose.model<ICounter>("Counter", CounterSchema);

export async function getNextOrderNumber(): Promise<number> {
  const counter = await Counter.findByIdAndUpdate(
    "order_number",
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter ? counter.seq : 1001;
}
