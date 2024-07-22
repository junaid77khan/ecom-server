
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { Product } from "../models/product-model.js";
import { Order } from "../models/order-model.js";
import mongoose, { isValidObjectId } from "mongoose";

const addOrder = asyncHandler(async(req, res) => {
    const {
        productId,
        overAllPrice,
        discountAmount,
        userPayAmount,
        email,
        phone,
        fullName,
        address,
        city,
        state,
        pin,
        paymentMethod
      } = req.body;

    let order = await Order.create({
        productId,
        overAllPrice,
        discountAmount,
        userPayAmount,
        email,
        phone, 
        fullName,
        address,
        city,
        state,
        pin,
        paymentMethod
    });

    if(!order) {
        throw new ApiError(500, "Order details adding Error")
    }

    let orderId = order._id;

    if(!orderId) {
        throw new ApiError(500, "Order details adding Error")
    }
    
    return res
        .json(new ApiResponse(200, orderId, "Order added successfully"));
})

const deleteOrder = asyncHandler(async(req, res) => {
    const{orderId} = req.params();

    if(!orderId || !isValidObjectId(orderId)) {
        throw new ApiError(400, "Invalid orderId");
    }

    const response = await Order.findByIdAndDelete(orderId);

    if(!response) {
        throw new ApiError(400, "Failed to delete order");
    }

    return res
    .status(200)
    .json(new ApiResponse(200, {response}, "Order deleted successfully"));
})

const allOrders = asyncHandler(async(req, res) => {
    const orders = await Order.aggregate([
        {
            $match: {}
        }
    ])

    return res
    .status(200)
    .json(new ApiResponse(200, orders, "Orders fetched successfully"));
})
export {addOrder, deleteOrder, allOrders}