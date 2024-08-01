import mongoose, { Schema } from "mongoose";
import { Product } from "./product-model.js";

const orderSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: {
    type: Number,
    required: [true, "Product quantity is required"]
  },
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
    default: "NA",
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

orderSchema.pre('save', async function(next) {
  const order = this;
  if (order.isNew) {
    try {
      const product = await Product.findById(order.productId);
      if (!product) {
        throw new Error('Product not found');
      }
      product.stock -= order.quantity;
      product.unitsSold += order.quantity;
      await product.save();
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

orderSchema.post('findOneAndDelete', async function(doc, next) {
  if (doc.status === 'cancelled' || doc.status === 'pending') {
    try {
      const product = await Product.findById(doc.productId);
      if (!product) {
        throw new Error('Product not found');
      }
      product.stock += doc.quantity;
      product.unitsSold -= doc.quantity;
      await product.save();
      next();
    } catch (error) {
      next(error);
    }
  }
  next();
});

export const Order = mongoose.model('Order', orderSchema);
