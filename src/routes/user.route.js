import { Router } from "express";
import { signup, verifyCode, signin, refreshAccessToken, logout, isUserLoggedIn } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middlware.js";

const router = Router()

router.route("/signup").post(
    signup
)

router.route("/verify-user").post(
    verifyJWT,
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