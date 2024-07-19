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
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review'
    }
  ],
  avgRating: {
    type: Number,
    default: 0, // Default average rating is 0
  },
}, { timestamps: true });

productSchema.methods.calculateAverageRating = async function () {
  console.log("Calculating avg");
  const Review = mongoose.model('Review');

  try {
    const reviews = await Review.find({ _id: { $in: this.ratingsReviews } }).exec();

    if (reviews.length === 0) {
      this.avgRating = 5; 
    } else {
      const totalRating = reviews.reduce((acc, curr) => acc + curr.rating, 0);
      this.avgRating = totalRating / reviews.length;
    }
  } catch (error) {
    console.error('Error calculating average rating:', error);
  }
};


productSchema.pre('save', async function (next) {
  try {
    await this.calculateAverageRating();
    console.log("Product avg rating", this.avgRating);
  } catch (error) {
    next(error);
  }
});

export const Product = mongoose.model('Product', productSchema);