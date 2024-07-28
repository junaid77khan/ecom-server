
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { Product } from "../models/product-model.js";
import { Order } from "../models/order-model.js";
import mongoose, { isValidObjectId } from "mongoose";

const addOrder = asyncHandler(async(req, res) => {
    const {
        productId,
        quantity,
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
        quantity,
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
    const{orderId} = req.params;

    if(!orderId || !isValidObjectId(orderId)) {
        throw new ApiError(400, "Invalid orderId");
    }

    // const order = await Order.findById(orderId)

    // if(!order) {
    //     throw new ApiError(404, "Order not found");
    // }

    // if(order.status === 'pending' || order.status === 'cancelled') {
    //     const product = await Product.findById(order.productId);
    //     product.stock += order.quantity;
    //     product.unitsSold -= order.quantity;
    //     await product.save();
    // }

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
        },
        {
            $sort: { createdAt: -1 }  
        }
    ]);

    return res
    .status(200)
    .json(new ApiResponse(200, orders, "Orders fetched successfully"));
})

const allCodOrders = asyncHandler(async(req, res)  => {
    const orders = await Order.aggregate([
        {
            $match: {
              paymentMethod: "COD"
            }
        },
        {
            $lookup: {
              from: 'products', 
              localField: 'productId',
              foreignField: '_id',
              as: 'product'
            }
          },
          {
            $addFields: {
              product: { $arrayElemAt: ["$product", 0] } 
            }
          },
          {
            $sort: { createdAt: -1 } 
          }
    ])

    return res
    .status(200)
    .json(new ApiResponse(200, orders, "Orders fetched successfully"));
})

const changeOrderStatus = asyncHandler(async(req, res) => {
    const{status, orderId} = req.body;

    console.log(req.body);

    if(!status || !orderId || !isValidObjectId(orderId)) {
        throw new ApiError(400, "Invalid data");
    }

    const order = await Order.findById(orderId);

    console.log(order);

    if(!order) {
        throw new ApiError(400, "Something went wrong while updating status");
    }

    order.status = status
    await order.save();

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Status changed"))
})

const deleteCODOrder = asyncHandler(async(req, res) => {
    const user = req?.user;

    if(!user || !user?.isAdmin) {
        return res.status(403).json({
            error: "Unauthorized access",
            message: "Access to this resource is restricted to administrators only"
        });
    }
    const {orderId} = req.params

    if(!orderId || !isValidObjectId(orderId)) {
        throw new ApiError(400, "Invalid data provided");
    }

    const codOrder=await Order.findById(orderId);

    if(!codOrder || codOrder.length === 0) {
        throw new ApiError(400, "No COD order exists");
    }

    // console.log("Checking status ", codOrder.status);

    // if(codOrder.status === 'pending' || codOrder.status === 'cancelled') {
    //     console.log("decreasing");
    //     const product = await Product.findById(codOrder.productId);
    //     product.stock += codOrder.quantity;
    //     product.unitsSold -= codOrder.quantity;
    //     await product.save();
    // }

    const response = await Order.findByIdAndDelete(orderId);

    if(!response) {
        throw new ApiError(400, "Error deleting COD order");
    }

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "COD Order deleted successfully"));
})
export {addOrder, deleteOrder, allOrders, allCodOrders, changeOrderStatus, deleteCODOrder}