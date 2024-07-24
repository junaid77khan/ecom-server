import mongoose from "mongoose";
import { Order } from "./order-model.js";

const paymentSchema = new mongoose.Schema({
  razorpay_order_id: {
    type: String,
    required: [true, "razorpay_order_id is required"]
  },
  razorpay_payment_id: {
    type: String,
    required: [true, "razorpay_payment_id is required"]
  },
  order_Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: [true, "Order _id is required"]
  }
}, {timestamps: true});

paymentSchema.pre('findOneAndDelete', async function(next) {
  try {

    const curRazorPayOrderId = this._conditions._id

    const curRazorPayOrder = await Payment.findById(curRazorPayOrderId);

    const curOrderId = curRazorPayOrder.order_Id;

    const curOrder = await Order.findById(curOrderId);

    if (!curOrder) {
      throw new Error("Associated Order not found");
    }

    const result = await Order.findByIdAndDelete(curOrderId);

    if(!result) {
      throw new Error("Deleting associated Order failed");
    }

    next();
  } catch (error) {
    next(error);
  }
});

export const Payment = mongoose.model("Payment", paymentSchema);