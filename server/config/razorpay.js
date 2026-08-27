import Razorpay from "razorpay";
import dotenv from 'dotenv'
dotenv.config()

// Lazily construct the Razorpay client so the whole server doesn't crash on
// boot when RAZORPAY_KEY / RAZORPAY_SECRET aren't configured yet (e.g. in
// local dev before payments are set up). Any code path that actually needs
// Razorpay (capturePayment/verifyPayment) will get a clear error instead of
// taking the entire backend down at startup.
let _instance = null;

const razorpayHandler = {
    get(_target, prop) {
        if (!_instance) {
            if (!process.env.RAZORPAY_KEY || !process.env.RAZORPAY_SECRET) {
                throw new Error(
                    "Razorpay is not configured. Set RAZORPAY_KEY and RAZORPAY_SECRET in server/.env to enable payments."
                );
            }
            _instance = new Razorpay({
                key_id: process.env.RAZORPAY_KEY,
                key_secret: process.env.RAZORPAY_SECRET,
            });
        }
        return _instance[prop];
    },
};

export const instance = new Proxy({}, razorpayHandler);