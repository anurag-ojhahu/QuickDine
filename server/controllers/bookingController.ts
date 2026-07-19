
import type { AuthRequest } from "../middlewares/auth.js";
import type { Response } from "express";
import { Booking } from "../models/Bookings.js";
import { Restaurant } from "../models/Restaurant.js";
// create a new booking 
// post /api/bookings

// @access: private
export const createBooking = async (req: AuthRequest, res: Response): Promise<void> => {

    try{
        const { restaurantId, date, time, guests, occasion, specialRequests} = req.body;

         if(!restaurantId || !date || !time || !guests){
            res.status(400).json({ message: "Missing required fields" });
            return;
         }
         // check if the restaurant exists
            const restaurant = await Restaurant.findById(restaurantId);
            if(!restaurant){
                res.status(404).json({ message: "Restaurant not found" });
                return;
            }
            // verify restarant is approved and available for booking
            if(restaurant.status !== "approved"){
                res.status(400).json({ message: "Restaurant is not available for booking" });
                return;
            }
            //verify seat availability 
            const requestedGuests = Number(guests);
            const existingBookings = await Booking.find({ restaurant: restaurantId, date: new Date(date), time, status: "confirmed" } );

            const boockedSeats = existingBookings.reduce((total, booking) => total + booking.guests, 0);
            const totalSeats = restaurant.totalSeats || 20;
            const availableSeats = totalSeats - boockedSeats;
            
            if(requestedGuests > availableSeats){
                res.status(400).json({ message: "Not enough seats available for the selected time slot" });
                return;
            }  
            const booking = await Booking.create({
                user: req.user?._id,
                restaurant: restaurantId,
                date: new Date(date),
                time,
                guests: requestedGuests,
                occasion,
                specialRequests,
                status: "confirmed"
            });

            // populate restaurant id before returning
            const populatedBooking = await booking.populate("restaurant", "name  address location image");
            res.status(201).json({ message: "Booking created successfully", booking: populatedBooking });

    }
        catch(error:any){
        console.error(error);
        res.status(400).json({ message: error.message });
    }
}

// get logged in user bookings
// post /api/bookings/me
// @access: private
 
export const getMyBookings = async (req: AuthRequest, res: Response): Promise<void> => {

    try{
        const bookings = (await Booking.find({ user:req.user?._id }).populate("restaurant", "name address location image")).sort({date: -1, time: -1});

         res.json(bookings);
    }catch(error:any){
        console.error(error);
        res.status(400).json({ message: error.message });
    }
}

// Cancel a booking 
// post /api/bookings/:id/cancel
// @access: private

export const cancelBooking = async (req: AuthRequest, res: Response): Promise<void> => {

    try{
        const booking = await Booking.findById(req.params.id);
        if(!booking){
            res.status(404).json({ message: "Booking not found" });
            return;
        }

        // check if the booking belongs to the logged in user
        if(booking.user.toString() !== req.user?._id.toString()){
            res.status(403).json({ message: "You are not authorized to cancel this booking" });
            return;
        }booking.status = "cancelled";
        await booking.save();
        
        const populatedBooking = await booking.populate("restaurant", "name address location image");
        res.json({ message: "Booking cancelled successfully", booking: populatedBooking });

         
    }catch(error:any){
        console.error(error);
        res.status(400).json({ message: error.message });
    }
}

