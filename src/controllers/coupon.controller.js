
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { Coupon } from "../models/coupon-model.js";
import { couponIdSchema } from "../schemas/productSchema.js";
import { discountValueSchema } from "../schemas/productSchema.js";
import { isValidObjectId } from "mongoose";

const addCoupon = asyncHandler(async(req, res) => {
    const user = req?.user;

    if(!user || !user?.isAdmin) {
        return res.status(403).json({
            error: "Unauthorized access",
            message: "Access to this resource is restricted to administrators only"
        });
    }
    let {couponId, discountValue, minRange} = req.params;

    if(!couponId || !discountValue || !minRange) {
        throw new ApiError(400, "Invalid data received");
    }

    let convertedMinRange = Number(minRange);

    if (isNaN(convertedMinRange) || !Number.isFinite(convertedMinRange)) {
        return res
            .status(400)
            .json(new ApiResponse(400, { "minRangeError": "MinRange must be a number" }, "Discount value error"));
    }

    minRange = convertedMinRange;

    discountValue = Number(discountValue)

    const couponIdValidation = couponIdSchema.safeParse({couponId})

    const discountValueValidation = discountValueSchema.safeParse({discountValue})

    if (!couponIdValidation.success) {
        const couponIdErrors = couponIdValidation.error.format().couponId?._errors[0] || [];
        return res
        .status(400)
        .json(new ApiResponse(400, {"couponIdError": couponIdErrors?.length > 0 ? couponIdErrors : "Invalid couponId"}, "CouponID error"))
    }

    if (!discountValueValidation.success) {
        const discountValueErrors = discountValueValidation.error.format().discountValue?._errors || [];
        return res
        .status(400)
        .json(new ApiResponse(400, {"discountValueError": discountValueErrors?.length > 0 ? discountValueErrors : "Invalid discount value"}, "Discount value error"))
    }

    const existedCoupon = await Coupon.find({couponId})

    if(existedCoupon.length > 0) {
        return res
        .status(400)
        .json(new ApiResponse(400, {"couponIdError": "Coupon already exists"}, "Coupon Error"))
    }

    const createdCoupon = await Coupon.create({
        couponId,
        discountValue,
        minRange
    });

    if(!createdCoupon) {
        throw new ApiError(500, {}, "Something went wrong while adding coupon")
    }

    return res
        .json(new ApiResponse(200, createdCoupon, "Coupon added!!"));
})

const getCoupons = asyncHandler(async (req, res) => {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });

    if (!coupons || coupons.length === 0) {
        throw new ApiError(400, "No coupons found");
    }

    return res.json(new ApiResponse(200, coupons, "Coupons fetched successfully"));
});


const deleteCoupons = asyncHandler(async(req, res) => {
    const user = req?.user;

    if(!user || !user?.isAdmin) {
        return res.status(403).json({
            error: "Unauthorized access",
            message: "Access to this resource is restricted to administrators only"
        });
    }

    const {couponId} = req.params;

    if(!couponId || !isValidObjectId(couponId)) {
        throw new ApiError(400, "Invalid coupon Id");
    }

    const response = await Coupon.findByIdAndDelete(couponId)

    if(!response) {
        throw new ApiError(400, {}, "Something went wrong while deleting coupon")
    }

    return res
        .json(new ApiResponse(200, response, "Coupon deleted!!"));
})

const getCouponById = asyncHandler(async(req, res) => {

    const {couponId} = req.body;

    if(!couponId) {
        throw new ApiError(400, "Invalid coupon Id");
    }

    const coupon = await Coupon.find({couponId})

    if(!coupon) {
        throw new ApiError(400, "Something went wrong while fetching coupon")
    }

    return res
        .json(new ApiResponse(200, coupon, "Coupon fetched!!"));
})

export {addCoupon, getCoupons, deleteCoupons, getCouponById}