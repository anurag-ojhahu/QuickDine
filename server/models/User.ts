
// import { model, Schema } from "mongoose";
import { model, Schema, type HydratedDocument } from "mongoose";

export interface IUser {
  name: string;
  phone: string;
  email: string;
  password?: string;
  role?: "user" | 'admin' |'owner';
  createdAt?: Date;
  updatedAt?: Date;
}

export type UserDocument = HydratedDocument<IUser>;
const userSchema = new Schema<IUser>({
  name: { type: String, required: true ,trim: true},
  email: { type: String, required: true, unique: true ,trim: true,lowercase: true},
  password: { type: String, required: true,minlength: 6},
  phone:{ type: String,minlength: 10, unique: true, trim: true},
  role: { type: String, enum: ["user", "admin", "owner"], default: "user" },    

}, { timestamps: true });


//remove password wehen converting to JSON
userSchema.set("toJSON", {
  transform: (doc, ret, options) => {
    delete ret.password;
    return ret;
  },
});

export const User = model("User", userSchema);
