import { Router } from "express";
import { signup, sendVerificationCode, updateUserDetails , verifyCode, signin, refreshAccessToken, logout, isUserLoggedIn, sendVerificationCodeThroughSMS, verifySMSOtp, curUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middlware.js";

const router = Router()

router.route("/signup").post(
    signup
)

router.route("/update-user-details").post(
    verifyJWT,
    updateUserDetails
)

router.route('/send-sms-otp').post(
    sendVerificationCodeThroughSMS
)

router.route("/verify-sms-otp").post(
    verifySMSOtp
)

router.route("/cur-user").get(
    verifyJWT,
    curUser
)

router.route("/resend-code").post(
    sendVerificationCode
)

router.route("/verify-user").post(
    verifyCode
)

router.route("/signin").post(
    signin
)

router.route("/refresh-token").post(
    refreshAccessToken
)

router.route("/logout").get(verifyJWT, logout)

router.route("/verification").get(isUserLoggedIn);
export default router