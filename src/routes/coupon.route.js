import { Router } from "express";
import { addCoupon, deleteCoupons, getCouponById, getCoupons } from "../controllers/coupon.controller.js";
import { verifyJWT } from "../middlewares/auth.middlware.js";

const router = Router()

router.route("/add-coupon/:couponId/:discountValue/:minRange").get(
    verifyJWT,
    addCoupon
);

router.route("/get-coupons").get(
    getCoupons
);

router.route("/delete-coupon/:couponId").get(
    verifyJWT,
    deleteCoupons
);

router.route("/coupon-by-id").post(
    verifyJWT,
    getCouponById
);

export default router