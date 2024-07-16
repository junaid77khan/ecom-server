import { Router } from "express";
import { signup, verifyCode, signin } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middlware.js";

const router = Router()

router.route("/signup").post(
    signup
)

router.route("/verify-user").post(
    verifyCode
)

router.route("/signin").post(
    signin
)
export default router