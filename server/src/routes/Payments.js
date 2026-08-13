import { Router } from "express";
import { capturePayment,verifySignature,verifyPayment } from "../controllers/Payments.js";
import { auth, isStudent } from "../middlewares/auth.middlewares.js";
const router = Router()

router.post("/capturePayment", auth, isStudent, capturePayment);
router.post("/verifyPayment", auth, isStudent, verifyPayment);
router.post("/verifySignature", verifySignature);
export default router