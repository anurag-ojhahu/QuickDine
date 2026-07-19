
import type { AuthRequest } from "../middlewares/auth.js";
import type { Response } from "express";
import { Restaurant } from "../models/Restaurant.js";
import { resolve } from "node:dns";
import { rejects } from "node:assert";
import {v2 as cloudinary} from "cloudinary";
import { Booking } from "../models/Bookings.js";
import { GiConfirmed } from "react-icons/gi";


// Helper function to upload buffer to cloudnary 
const uploadToCloudinary = (filebuffer:Buffer): Promise<{secure_url:string}> =>{
    return new Promise((resolve,reject)=>{
        const stream = cloudinary.uploader.upload_stream({folder: "QuickDine"},(error,result)=>{
            if(error){
                return reject(error);
            }
            if(!result) return reject( new Error("upload failed"));
            resolve({secure_url:result.secure_url})

        })
        stream.end(filebuffer)
    })
}

// get owners restaurant 

// type GET /api/owner/restaurant
export const getOwnerRestaurant = async (req:AuthRequest, res:Response):Promise<void> =>{
 try {
    // use _id which exists on the user model/type instead of id
    const restaurant = await Restaurant.findOne({ owner: req.user?._id })
    if(!restaurant){
        res.status(200).json(null);
        return;
    }
    res.json(restaurant);
    
 } catch (error:any) {
   console.error(error);
   res.status(400).json({message: error.message});
 }

}


// create owners restaurant 
// type POST /api/owner/restaurant
export const createOwnerRestaurant = async (req:AuthRequest, res:Response):Promise<void> =>{
 try {
    const existing = await Restaurant.findOne({ owner: req.user?._id })
    if(existing){
      res.status(400).json({message:"you already have a restaurant for this data"});
        return;
    }
    const{name, description, cuisine, priceRange, location, address, chef,availableSlots, totalSeats, tags} = req.body;

    if(!name || !description || !cuisine || !priceRange || !location || !address || !chef || !availableSlots || !totalSeats){
       res.status(400).json({message: "incomplete restaurant information for creating a new restaurant"})
         return;
    }

   // generte slug from name
     const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g,"");
     const slugExists = await Restaurant.findOne({slug});

     if(slugExists){
        res.status(400).json({messgae:" the slug with this name already exists"});
        return;
     }

     // Handle Image
     let imageUrl = "";
     if(req.file){
        // handle image upload
        const result = await uploadToCloudinary(req.file.buffer);
        imageUrl = result.secure_url;

     } 

     //setup parged tags and slots
     const parsedTags = typeof tags === "string"? tags.split(",").map((t)=> t.trim()): tags || [];
     const parsedSlots = typeof availableSlots === "string"?availableSlots.split(",").map((s) => s.trim()) : availableSlots || ["17:00","18:00","19:00","20:00","21:00"]

     const restaurant = await Restaurant.create({
        name,
        slug,
        description,
        cuisine,
        priceRange,
        location,
        address,
        chef,
        image:imageUrl,
        tags: parsedTags,
        available_slots:parsedSlots,
        totalSeats: totalSeats?Number(totalSeats):20,
        owner:req.user?._id,
        status: "pending",


     })
     res.status(201).json(restaurant);


 } catch (error:any) {
   console.error(error);
   res.status(400).json({message: error.message});
 }

}



// update owners restaurant 
// type PUT /api/owner/restaurant
export const updateOwnerRestaurant = async (req:AuthRequest, res:Response):Promise<void> =>{
 try {
    const restaurant = await Restaurant.findOne({owner:req.user?._id})
    if(!restaurant){
        res.status(404).json({message:"restaurant profile not founf"});
        return; 
    }
    const{name, description, cuisine, priceRange, location, address, chef,availableSlots, totalSeats, tags} = req.body;
    if(name) restaurant.name = name;
    if(description) restaurant.description = description;
     if(cuisine) restaurant.cuisine = cuisine;
    if(priceRange) restaurant.priceRange = priceRange;
   if(location) restaurant.location = location;
   if(address) restaurant.address = address;
   if(chef) restaurant.chef = chef;
   if(totalSeats) restaurant.totalSeats = totalSeats;

   if(tags){
     restaurant.tags = typeof tags === "string" ? tags.split(",").map((t)=>t.trim()):tags;
   }
   if(availableSlots){
    restaurant.available_slots = typeof availableSlots === "string"?availableSlots.split(",").map((s)=>s.trim()):availableSlots;
   }

   // Handle new upload image if any;
     if(req.file){
        // handle image upload
        const result = await uploadToCloudinary(req.file.buffer);
        restaurant.image = result.secure_url;
     } 
     const updated = await restaurant.save();
 res.json(updated);
 } catch (error:any) {
   console.error(error);
   res.status(400).json({message: error.message});
 }

}


// get bookings for owners restaurant 
// type GET /api/owner/restaurant
export const getOwnerBookings = async (req:AuthRequest, res:Response):Promise<void> =>{
 try {
      const restaurant = await Restaurant.findOne({owner:req.user?._id})
       if(!restaurant){
        res.status(404).json({message:"restaurant profile not founf"});
        return; 
    }
    const bookings = (await Booking.find({restaurant:restaurant._id}).populate("user","name email phone")).sort({date:-1, time:-1})
    res.json(bookings)
 } catch (error:any) {
   console.error(error);
   res.status(400).json({message: error.message});
 }

} 


// update the booking status for owners restaurant 
// type GET /api/owner/restaurant/:id/status
export const updateBookingStatus = async (req:AuthRequest, res:Response):Promise<void> =>{
 try {
    const status = req.body;
    if(!status || !["confirmed", "completed","cancelled"].includes(status) ){
        res.status(400).json({message: "pleae enter a valid booking status"})
        return;
    }
    const booking = await Booking.findById(req.params.id)

    if(!booking){
        res.status(404).json({message:"restaurant not found"})
        return 
    }

    // verify booking belongs to the owners reataurnts
    const restaurant = await Restaurant.findById(booking.restaurant);
   if(!restaurant || restaurant.owner.toString() !== req.user?._id.tostring()){
      res.status(401).json({message:"Not authorised to manage this booking"})
      return
   }
   booking.status = status;
    await booking.save()
    res.json(booking)  
 } catch (error:any) {
   console.error(error);
   res.status(400).json({message: error.message});
 }

} 
