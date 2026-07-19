// get all restaurents with search and filter
import type{ Request, Response } from "express";
import type{ IRestaurant} from "../models/Restaurant.js";
import { Restaurant } from "../models/Restaurant.js";
import { User } from "../models/User.js";
import jwt from "jsonwebtoken";
import {Booking} from "../models/Bookings.js";


// get
// path: /api/restaurants
// access: public
export const getRestaurants = async (req: Request, res: Response): Promise<void> =>{
    try{
const{search, priceRange, location, rating, sort} = req.query;
//build query object based on search and filter parameters
        const queryObj:any ={status: "approved"};
        if(search){
            queryObj.$or = [{ name: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } },
                { tags: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } },
                { location: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }
            ];
        }
        if(priceRange){
            const prices = Array.isArray(priceRange) ? priceRange:[priceRange];
            queryObj.priceRange = { $in: prices };
           
        } 
        if(location){
            queryObj.location  = { $regex: location as string, $options: "i" };
        }
        if(rating){
            queryObj.rating = { $gte:parseFloat(rating as string) };
           
        }
        //sortingl
       let sortOption: any = { createdAt:-1 };
       if(sort === "rating"){
        sortOption = { rating:-1 };
       }else if(sort === "price_low"){
        sortOption = { priceRange:1 };
       }else if(sort === "price_high"){
        sortOption = { priceRange:-1 };
       }
       const restaurant = await Restaurant.find(queryObj).sort(sortOption);
       res.json(restaurant);
    } catch(error:any){
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}



// get featured and exclusive restaurants
// API: GET /api/restaurants/featured
// access: public
export const getFeaturedRestaurants = async (req: Request, res: Response): Promise<void> =>{
    try{
        const featured = await Restaurant.find({ status: "approved",
            $or: [{ featured: true }, { exclusive: true }]
         }).limit(6);

        
        res.json(featured);
        
    }catch(error:any){
        console.error("get featured restaurants error:",error);
        res.status(500).json({ message: error.message });
    }
} 


// get single restaurants by slug
// API: GET /api/restaurants/slug
// access: public
export const getRestaurantsBySlug = async (req: Request, res: Response): Promise<void> =>{
    try{
       
        const restaurant = await Restaurant.findOne({ slug: req.params.slug});
        if(!restaurant){ 
            res.status(404).json({ message: "Restaurant not found" });
            return;
        }
        //if not approved verify the user is the owner of the restaurant
       if(restaurant.status !== "approved"){ 
        let isAuthorised = false;
        if(req.headers.authorization && req.headers.authorization.startsWith("Bearer ")){

           try{
            const token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
            const user = await User.findById(decoded.id);
            if(user && (user.role === "admin") || user && (user.role === "owner" && restaurant.owner.toString() === user._id.toString() ) ){
                isAuthorised = true;
            }
           }catch(error:any){
// ignore any token verify error and return 403
           }
           if(!isAuthorised){
            res.status(404).json({ message: "Restaurant not found" });
            return;
        }
      
       }
        
res.json(restaurant);
    }
}catch(error:any){
        console.error("get restaurants by slug error:",error);
        res.status(500).json({ message: error.message });
    }
}


// get dynamic seat availabilityrestaurants for slots
// API: GET /api/restaurants/:id/availability
// access: public
export const getRestaurantsAvailability = async (req: Request, res: Response): Promise<void> =>{
    try{
        const {date}  = req.query;
        if(!date){
            res.status(400).json({ message: "Date query parameter is required" });
            return;
        }
        const restaurant = await Restaurant.findById(req.params.id);
        if(!restaurant){
            res.status(404).json({ message: "Restaurant not found" });
            return;
        }
        const bookingDate = new Date(date as string);

        //get ALL ACTIVE BOOKINGF ON THIS DATE 

        const bookings = await Booking.find({ restaurant: restaurant._id, date: bookingDate, status: { $in:  ["confirmed"] } });

        // map the bookings to get the total guests for each time slot
        const availability = restaurant.available_slots.map((slot) => {
            const bookSeats = bookings.filter((booking) => booking.time === slot).reduce((sum,booking) => sum + booking.guests, 0);
            const totalSeats = restaurant.totalSeats || 20;
            const availableSeats = Math.max(totalSeats - bookSeats, 0);
            return { 
                time: slot, 
                availableSeats,
                isAvailable: availableSeats > 0

             };
        });
        res.json(availability);

        
    }catch(error:any){
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

