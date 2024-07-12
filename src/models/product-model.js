import mongoose, {Schema} from "mongoose"

const specificationSchema = new Schema({
  name: {
      type: String,
      required: true,
  },
  value: {
      type: String,
      required: true,
  },
});

const productSchema = new Schema({
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    features: [String],
    specification:[specificationSchema],
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
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true
    },
    images: {
      type: Array,
      required: true,
    },
    offer: {
      type: Number,
      default: null,
    },
    ratingsReviews: [
        {
            review: String,
            user: { type: Schema.Types.ObjectId, ref: "User" },
            rating: Number,
            createdAt: {
                type: Date,
                default: Date.now(),
            },
        },
    ],
    availability: {
      type: Boolean,
      required: true,
      default: true
    },
  },
 {timestamps: true});

export const Product = new mongoose.model('Product', productSchema);
