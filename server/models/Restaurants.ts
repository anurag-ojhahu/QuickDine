import mongoose, { model, Types } from "mongoose";
import {Schema} from "mongoose";
import Document = mongoose.Document;
 
export interface IRestaurant extends Document {
  name: string;
  slug: string;
  description: string;
  cuisine: string;
  priceRange: "$" | "$$" | "$$$" | "$$$$";
  rating: number;
  reviewCount: number;
  address:string;
  location:string;
  chef: string;
  image: string;
  tags: string[];
  featured: boolean;
  available_slots: string[];
  exclusive: boolean;
  owner: Types.ObjectId;
  status: "pending" | "approved" | "rejected";
  totalSeats: number;
  createdAt?: Date;
  updatedAt?: Date;

}


const RestaurantSchema = new Schema<IRestaurant>({
  name: { type: String, required: true ,trim: true},
  slug: { type: String, required: true, lowercase: true, unique: true ,trim: true},
  description: { type: String, required: true ,trim: true},
  cuisine: { type: String, required: true ,trim: true},
  priceRange: { type: String, enum: ["$", "$$", "$$$", "$$$$"], required: true },
  rating: { type: Number,default:0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  address:{ type: String, required: true ,trim: true},
  location:{ type: String, required: true ,trim: true},
  chef: { type: String, required: true ,trim: true},
  image: { type: String,default: "", required: true ,trim: true},
  tags: [{ type: String, trim: true }],
  featured: { type: Boolean,default: false, trim:true },
  available_slots: [{ type: String, default: [] }],
  exclusive: { type: Boolean, default:false },
  owner: { type: Schema.Types.ObjectId, ref: "User", required:true },
  status: { type:String, enum:["pending", "approved", "rejected"], default:"pending" },
  totalSeats: { type:Number, required:true,default:20 },
}, { timestamps:true });



export const Restaurant = model<IRestaurant & mongoose.Document>("Restaurant", RestaurantSchema);