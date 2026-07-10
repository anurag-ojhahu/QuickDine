import router from "express";
import { getme, loginUser, registerUser ,} from "../controllers/authController.js";
import { protect } from "../middlewares/auth.js";

const authRoutes = router.Router();
authRoutes.post("/register", registerUser);
authRoutes.post("/login", loginUser);
authRoutes.get("/me", protect, getme);

export default authRoutes;