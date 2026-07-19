import type { AuthRequest } from "../middlewares/auth.js";
import type { Response } from "express";
import { Restaurant, type IRestaurant } from "../models/Restaurant.js";
import { User } from "../models/User.js";
import { Booking } from "../models/Bookings.js";

 
// get all restaurants for admin managemnet 
//  GET api/admin/restaurants 
export const getAllReataurants = async (req:AuthRequest,res:Response): Promise<void> =>{
try {
    const restaurants = await  Restaurant.find({}).populate("owner","name email phone").sort({createdAt:-1})
    res.json(restaurants)
} catch (error:any) {
    console.error(error)
    res.status(400).json({message: error.message})
}
}





// Approve r reject restaurants restaurants for admin managemnet 
//  PUT api/admin/restaurants/:id/approve
export const approveReataurants = async (req:AuthRequest,res:Response): Promise<void> =>{
try {
    const { status } = req.body as { status?: IRestaurant["status"] };
    if(!status || !["approved","rejected","pending"].includes(status)){
        res.status(400).json({message:"Please provide valid approval status"}) 
        return;
    }
    const restaurant = await Restaurant.findById(req.params.id)
    if(!restaurant){
        res.status(404).json({message:"Restaurant not found"}) 
        return;
    }
    restaurant.status = status;
   await restaurant.save()
    res.json(restaurant)

} catch (error:any) {
    console.error(error)
    res.status(400).json({message: error.message})
}
}



// get system statics
//  GET api/admin/stats 
export const getAdminStats = async (req:AuthRequest,res:Response): Promise<void> =>{
try {
    const totalUsers  = await User.countDocuments({role: "user"})
         const totalOwners  = await User.countDocuments({role: "owner"})


         const totalBookings = await Booking.countDocuments({})

         const totalRestaurants = await Restaurant.countDocuments({})

         // get 10 latest bookings
        const latestBookings = await Booking.find({})
            .populate("user", "name email")
            .populate("restaurant", "name")
            .sort({ createdAt: -1 })
            .limit(10);

        res.json({
            users:{
                totalUsers,
                totalOwners,
                total: totalOwners + totalUsers,
            },
            restaurants: {
                total: totalRestaurants,
            },
            bookings :{
                total: totalBookings,
            },
            latestBookings,
        })
} catch (error:any) {
    console.error(error)
    res.status(400).json({message: error.message})
}
}
