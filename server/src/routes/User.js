import {Router} from 'express'
import { sendOTP,login,signUp,changePass } from '../controllers/Auth.js'
import { ResetPasswordToken,resetPassword } from '../controllers/ResetPassword.js'
import {
  auth,
  isInstructor,
  isAdmin
} from "../middlewares/auth.middlewares.js";

const router = Router()

//router for user login
router.post("/login",login)

//router for signup
router.post("/signup",signUp);

//router for changePass

router.post("/changepassword",auth,changePass);

//router for sendOtp
router.post("/sendotp",sendOTP)
router.post("/reset-password-token",ResetPasswordToken)
router.post("/reset-password",resetPassword)


export default router;