import {Router} from "express"
import { approveReataurants, getAdminStats, getAllReataurants } from "../controllers/adminController.js"
import { adminOnly, protect } from "../middlewares/auth.js"
const adminRouter = Router()

adminRouter.use(protect)
adminRouter.use(adminOnly)
 
adminRouter.get("/restaurants",getAllReataurants)
adminRouter.put("/restaurants/:id/approve",approveReataurants)
adminRouter.get("/stats",getAdminStats)


export default adminRouter