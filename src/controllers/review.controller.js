
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { Category } from "../models/categories-model.js";
import { Product } from "../models/product-model.js";
import { Cart } from "../models/cart-model.js";
import { nameSchema, ProductSchema } from "../schemas/productSchema.js";
import { uploadOnCloudinary, destroyOnCloudinary } from "../utils/cloudinary.js";
import mongoose, { isValidObjectId } from "mongoose";
import fs from 'fs'; 
import { User } from "../models/user-model.js";
import { Review } from "../models/review-model.js";

const addReview = asyncHandler(async(req, res) => {
    let {productId, rating, review} = req.body;

    if(!productId || !rating || !review || !isValidObjectId(productId)) {
        throw new ApiError(400, "ProductId, UserId, rating and review each are required and each should be valid");
    }

    let user = req.user;
    if(!user) {
        throw new ApiError(400, "No user found");
    }

    rating = Number(rating);
    if(typeof rating !== 'number') {
        throw new ApiError(400, "Rating should be a number");
    }

    let product = await Product.findById({_id: productId});

    if(!product) {
        return res
        .json(new ApiResponse(404, "No product found"))
    }

    const createdReview = await Review.create({
        userId: user._id,
        productId: product._id,
        rating,
        review
    });

    if(!createdReview) {
        throw new ApiError(500, "Something went wrong while adding review")
    }

    const reviewId = createdReview._id;
    
    product.ratingsReviews.push(reviewId);
    
    await product.save();

    const reviews = await Review.find({productId}).populate('userId');

    return res
        .json(new ApiResponse(200, reviews, "Review added to the product"));
})

const getProductReviews = asyncHandler(async (req, res) => {
    const { productId } = req.body;

    if (!productId) {
        throw new ApiError(400, "Product Id is required");
    }

    // Find the product by its ObjectId
    const product = await Product.findById(productId);

    if (!product) {
        return res.status(404).json(new ApiResponse(404, {}, "Product not found"));
    }

    // Find reviews associated with the product ObjectId
    const reviews = await Review.find({ productId: product._id }).populate('userId');

    if (!reviews) {
        throw new ApiError(500, "Something went wrong while fetching reviews");
    }

    return res.status(200).json(new ApiResponse(200, reviews, "Reviews fetched"));
});
export {addReview, getProductReviews}