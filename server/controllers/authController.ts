// Register the user
import type { Request, Response } from "express";
import { User } from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import type { AuthRequest } from "../middlewares/auth.js";

//POST /api/auth/register

const generateToken = (d: string) => {
    return jwt.sign({ id: d }, process.env.JWT_SECRET as string, {
        expiresIn: "30d",
    });
};

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, role} = req.body;
    if(!email || !password || !name || !phone){
      return res.status(400).json({ message: "Please provide all required fields" });
    }
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    } 

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role,
    })
    if(user){
        res.status(201).json({ message: "User registered successfully",
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            token: generateToken(user._id.toString()),
        });
        
    }else{
        res.status(400).json({ message: "Invalid user data and the user could not be created" });
    }


    await user.save();

    res.status(201).json({ message: "User registered successfully", user: user });
  } catch (error:any) {
    console.error(error);
    res.status(500).json({ message: error.message  });
  }     
}

 

  //login user
  //POST /api/auth/login
  //@access Public

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if(!email || !password){
      return res.status(400).json({ message: "Please provide all required fields" });
    }
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
 
    // Check password
    const isMatch = await bcrypt.compare(password, user.password || "" );
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
      return;
    }
    res.json({
        _id: user._id,  
        name: user.name,

        email: user.email,
        phone: user.phone,
        role: user.role,
        token: generateToken(user._id.toString()),

    })

    // res.status(200).json({ message: "Login successful", user });
  } catch (error:any) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

 // Get user profile
  // GET /api/auth/profile
  //@access Private

//   const getUserProfile = async (req: Request, res: Response) => {
//     try {
//       const userId = req.user?.id; // Assuming you have a middleware that sets req.user
//       if (!userId) {
//         return res.status(401).json({ message: "Unauthorized" });
//       }
  
//       const user = await User.findById(userId).select("-password");
//       if (!user) {
//         return res.status(404).json({ message: "User not found" });
//       }
  
//       res.json(user);
//     } catch (error:any) {
//       console.error(error);
//       res.status(500).json({ message: error.message });
//     }
//   };

  // Update user profile
    // PUT /api/auth/profile
    //@access Private   

  export const getme = async (req: AuthRequest, res: Response) : Promise<void> => {
    try {
        if(!req.user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        res.json(req.user);

    //   const userId = req.user?.id; // Assuming you have a middleware that sets req.user
    //   if (!userId) {
    //     res.status(401).json({ message: "Unauthorized" });
    //     return;
    //   }
  
    //   const user = await User.findById(userId).select("-password");
    //   if (!user) {
    //     res.status(404).json({ message: "User not found" });
    //     return;
    //   }
  
    //   res.json(user);
    } catch (error:any) {
      console.error(error);
      res.status(500).json({ message: error.message });
    } 
  };