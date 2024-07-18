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
  actualPrice: {
    type: Number,
    required: [true, "Actual price is required"],
  },
  salePrice: {
    type: Number,
    required: [true, "Sale price is required"],
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
      rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now(),
      },
    },
  ],
  avgRating: {
    type: Number,
    default: 0, // Default average rating is 0
  },
}, { timestamps: true });

productSchema.methods.calculateAverageRating = function () {
  const ratingsCount = this.ratingsReviews.length;
  if (ratingsCount === 0) {
    this.avgRating = 0;
  } else {
    const sum = this.ratingsReviews.reduce((acc, curr) => acc + curr.rating, 0);
    this.avgRating = sum / ratingsCount;
  }
};

productSchema.pre('save', function (next) {
  this.calculateAverageRating();
  next();
});

export const Product = mongoose.model('Product', productSchema);