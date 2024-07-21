import { Router } from "express";
import { addReview, getProductReviews } from "../controllers/review.controller.js";
import { verifyJWT } from "../middlewares/auth.middlware.js";

const router = Router()

router.route("/add-review").post(
    verifyJWT,
    addReview
)
router.route("/get-product-reviews").post(
    getProductReviews
)

export default router