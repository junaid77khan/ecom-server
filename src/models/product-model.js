import mongoose from 'mongoose';

const specificationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  features: {
    type: [{
      type: String,
      required: true,
    }],
  },
  specifications: {
    type: [{
      type: specificationSchema,
      required: true
    }]
  },
  price: {
    type: Number,
    required: true,
  },
  unitsSold: {
    type: Number,
    default: 0,
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  images: {
    type: [{
      type: String,
      required: true,
    }],
  },
  offer: {
    type: Number,
    default: null,
  },
  ratingsReviews: [
    {
      review: String,
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      rating: Number,
      createdAt: {
        type: Date,
        default: Date.now(),
      },
    },
  ],
}, { timestamps: true });

export const Product = mongoose.model('Product', productSchema);