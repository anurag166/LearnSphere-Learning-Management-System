import { Router } from "express";
import {
    updateProfile,deleteAccount,getAllUserDetails,updateDisplayPicture
}
from '../controllers/Profile.js'
import { auth } from "../middlewares/auth.middlewares.js";
const router = Router()

router.put("/updateProfile",auth ,updateProfile)
router.put("/updateDisplayPicture",auth ,updateDisplayPicture)
router.post("/updateDisplayPicture",auth ,updateDisplayPicture)
router.put("/update-display-picture",auth ,updateDisplayPicture)
router.post("/update-display-picture",auth ,updateDisplayPicture)
router.delete("/deleteAccount",auth ,deleteAccount)
router.get("/getAllUserDetails",auth ,getAllUserDetails)

export default router