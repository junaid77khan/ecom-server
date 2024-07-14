import { Router } from "express";
import { registerUser, verifyCode } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middlware.js";

const router = Router()

router.route("/signup").post(
    registerUser
)

router.route("/verify-user").post(
    verifyCode
)

export default router