import type { Request,NextFunction,Response } from "express";
import {User, type IUser } from "../models/User.js";
import jwt from "jsonwebtoken";
//import { User } from "../models/User.js";

export interface AuthRequest extends Request {
  user?: IUser;
//    {
//     _id: string;
//     name: string;
//     email: string;
//     phone: string;
//     role: "user" | "admin" | "owner";
//   };
}

export const protect = async(req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    let token;
    if(req.headers.authorization &&req.headers.authorization.startsWith("Bearer ")){
        try{
            // get token from the bearer
           token = req.headers.authorization.split(" ")[1];
            // verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
            // get user from the token
            const user = await User.findById(decoded.id).select("-password");
            if(!user){
                res.status(401).json({ message: "Not authorized, user not found" });
                return;
            }
            req.user = user;
            next(); 
        }
        catch(error: any){
            console.error(error);
            res.status(401).json({ message: "Not authorized, token failed" });
            return;
        }
    }
        if(!token){
            res.status(401).json({ message: "Not authorized, no token" });
            return;
        
    }
}

export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction): void => {
    if(req.user && req.user.role === "admin" || req.user &&req.user.role === "owner"){
        next();
    }else{
        res.status(403).json({ message: "Access denied, admin only" });
        return;
    }
}   

//\\