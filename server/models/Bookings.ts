
 import {Types} from "mongoose";
 import mongoose, { model } from "mongoose";
import {Schema} from "mongoose";
import type { IUser } from "./User.js";
import crypto from "crypto";

export interface IBooking extends Document {
 user: Types.ObjectId;
 restaurant: Types.ObjectId;
 date: Date;
 time: string;
 guests: number;
 occasion?: string;
 specialRequests?: string;
 status: "pending" | "confirmed" | "cancelled" | "completed";
 bookingId: string;
 createdAt?: Date;
 updatedAt?: Date;
}

const bookingSchema = new Schema<IBooking>({
 user: { type: Schema.Types.ObjectId, ref: "User", required: true },
 restaurant: { type: Schema.Types.ObjectId, ref: "Restaurant", required: true },
 date: { type: Date, required: true },
 time: { type: String, required: true },
 guests: { type: Number, required: true ,min: 1, max: 20 },
 status: { type: String, enum: ["pending", "confirmed", "cancelled", "completed"], default: "confirmed" },
 bookingId: {
  type: String,
  required: true,
  unique: true,
  default: () => `GR-${crypto.randomBytes(4).toString("hex").toUpperCase()}`,
},
 occasion: { type: String, trim: true },
 specialRequests: { type: String, trim: true },
}, { timestamps: true });


// bookingSchema.pre("save", function() {
//     if(!this.bookingId){
//         this.bookingId = `GR-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
//     }
// })

export const Booking = model<IBooking>("Booking", bookingSchema);
  