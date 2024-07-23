import mongoose from "mongoose";

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
});

export const Payment = mongoose.model("Payment", paymentSchema);