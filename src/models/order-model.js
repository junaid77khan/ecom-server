import mongoose, { Schema } from "mongoose";

const orderSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  overAllPrice: {
    type: Number,
    required: [true, "Overall price is required"]
  },
  discountAmount: {
    type: Number,
    required: [true, "Discount amount is required"]
  },
  userPayAmount: {
    type: Number,
    required: [true, "Amount paid by user is required"]
  },
  email: {
    type: String,
    required: [true, "Email is required"]
  },
  phone: {
    type: String,
    required: [true, "Phone number is required"]
  },
  fullName: {
    type: String,
    required: [true, "Fullname is required"]
  },
  address: {
    type: String,
    required: [true, "Address is required"]
  },
  city: {
    type: String,
    required: [true, "City is required"]
  },
  state: {
    type: String,
    required: [true, "State is required"]
  },
  pin: {
    type: String,
    required: [true, "Pin is required"]
  },
  paymentMethod: {
    type: String,
    enum: ['COD', 'RazorPay'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'], 
    default: 'pending' 
  }
}, { timestamps: true });

export const Order = mongoose.model('Order', orderSchema);
