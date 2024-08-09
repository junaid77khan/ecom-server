import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  couponId: {
    type: String,
    required: true,
  },
  discountValue: {
    type: Number,
    required: true,
  },
  minRange: {
    type: Number,
    required: true
  }
}, { timestamps: true });

export const Coupon = mongoose.model('Coupon', couponSchema);