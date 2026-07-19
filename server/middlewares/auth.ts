import type { Request,NextFunction,Response } from "express";
import {User, type UserDocument } from "../models/User.js";
import jwt from "jsonwebtoken";
//import { User } from "../models/User.js";

export interface AuthRequest extends Request {
  user?: UserDocument;
//    {
//     _id: string;
//     name: string;
//     email: string;
//     phone: string;
//     role: "user" | "admin" | "owner";
//   };
}

export const protect = async(req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const token = req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : undefined;

    if (!token) {
        res.status(401).json({ message: "Not authorized, no token" });
        return;
    }

    try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as jwt.JwtPayload;
            if (typeof decoded.id !== "string") {
                res.status(401).json({ message: "Not authorized, invalid token" });
                return;
            }
            // get user from the token
            const user = await User.findById(decoded.id).select("-password");
            if(!user){
                res.status(401).json({ message: "Not authorized, user not found" });
                return;
            }
            req.user = user;
            next();
        } catch(error: unknown){
            console.error(error);
            res.status(401).json({ message: "Not authorized, token failed" });
            return;
        }
}

export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction): void => {
    if(req.user?.role === "admin"){
        next();
    }else{
        res.status(403).json({ message: "Access denied, admin only" });
        return;
    }
}   

export const ownerOnly = (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (req.user?.role === "owner") {
        next();
        return;
    }

    res.status(403).json({ message: "Access denied, owner only" });
};

//\\
