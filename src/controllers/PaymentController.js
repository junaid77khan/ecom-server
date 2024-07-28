import { instance } from "../../index.js";
import crypto from "crypto";
import { Payment } from "../models/PaymentModel.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import mongoose, {isValidObjectId} from "mongoose";

export const checkout = async (req, res) => {
  const options = {
    amount: Number(req.body.amount * 100),
    currency: "INR",
  };
  const order = await instance.orders.create(options);

  res.status(200).json({
    success: true,
    order,
  });
};

export const paymentVerification = async (req, res) => {
  console.log(req.body);
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;
  console.log(req.body);

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", "ChsggKSAQkx7xs4hE0Fb37zh")
    .update(body.toString())
    .digest("hex");
  console.log(req.body);

  const isAuthentic = expectedSignature === razorpay_signature;
  console.log(req.body);

  if (isAuthentic) {
    // Database comes here
    console.log(req.body);

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    await Payment.create({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });
    console.log(req.body);

   


    const redirectUrl = `http://localhost:7000/checkout?reference=${razorpay_payment_id}&order_id=${razorpay_order_id}&signature=${razorpay_signature}`;

    res.redirect(redirectUrl);
    console.log(req.body);
  } else {
    res.status(400).json({
      success: false,
    });
  }
};


const addRazorPayPaymentSuccess = asyncHandler(async (req, res) => {
  let {razorpay_order_id, razorpay_payment_id, order_Id} = req.body;
  console.log(req.body);

  const response = await Payment.create({
    razorpay_order_id,
    razorpay_payment_id,
    order_Id
  })

  return res
  .status(200)
  .json(new ApiResponse(200, response, "Payment details added"))
})

const getAllRazorPayOrdersBYId = asyncHandler(async(req, res) => {
  const orders = await Payment.aggregate([
    {
      $lookup: {
        from: 'orders',
        localField: 'order_Id',
        foreignField: '_id',
        as: 'orderDetails'
      }
    },
    {
      $unwind: '$orderDetails'
    },
    {
      $lookup: {
        from: 'products',
        localField: 'orderDetails.productId',
        foreignField: '_id',
        as: 'orderDetails.product'
      }
    },
    {
      $unwind: '$orderDetails.product'
    },
    {
      $sort: { 'orderDetails.createdAt': -1 }  
    }
  ]);

  const user = req.user;
  if(!user || !user.isAdmin) {
    throw new ApiError(500, "Unauthorized access");
  }

  if(!orders) {
    throw new ApiError(500, "Failed to fetch RazorPay orders");
  }

  return res
  .status(200)
  .json(new ApiResponse(200, orders, "fetched successfully"));
})

const deleteRazorPayOrder = asyncHandler(async(req, res) => {
  const user = req?.user;

    if(!user || !user?.isAdmin) {
        return res.status(403).json({
            error: "Unauthorized access",
            message: "Access to this resource is restricted to administrators only"
        });
    }
  const{orderId} = req.params;

  if(!orderId || !isValidObjectId(orderId)) {
    throw new ApiError(400, "Invalid data provided");
  }

  const razorPayOrder = await Payment.findById(orderId);

  if(!razorPayOrder || razorPayOrder.length === 0) {
    throw new ApiError(400, "No RazorPay order exists");
  }
  
  const response = await Payment.findByIdAndDelete(orderId);

  if(!response) {
    throw new ApiError(500, "Error deleting RazorPay Order");
  }

  return res
  .status(200)
  .json(new ApiResponse(200, response, "RazorPay Order Deleted successfully"));
})

export {addRazorPayPaymentSuccess, getAllRazorPayOrdersBYId, deleteRazorPayOrder};