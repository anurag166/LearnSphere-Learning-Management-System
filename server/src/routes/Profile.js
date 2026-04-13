import { Router } from "express";
import {
    updateProfile,deleteAccount,getAllUserDetails
}
from '../controllers/Profile.js'
import { auth } from "../middlewares/auth.middlewares.js";
const router = Router()

router.put("/updateProfile",auth ,updateProfile)
router.delete("/deleteAccount",auth ,deleteAccount)
router.get("/getAllUserDetails",auth ,getAllUserDetails)

export default router