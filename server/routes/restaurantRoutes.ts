import {Router} from "express";
import { getRestaurants, getFeaturedRestaurants, getRestaurantsBySlug,getRestaurantsAvailability,} from "../controllers/restaurantController.js";

const restaurantRouter = Router();

// get all restaurants with search and filter
restaurantRouter.get("/", getRestaurants);

// get featured and exclusive restaurants
restaurantRouter.get("/featured", getFeaturedRestaurants);

// get restaurant by slug
restaurantRouter.get("/:slug", getRestaurantsBySlug);
  
// get restaurant by id
restaurantRouter.get("/:id/availability", getRestaurantsAvailability);

export default restaurantRouter;