import mongoose, {Schema} from "mongoose"

const reviewSchema = new Schema({
    name: { type: String,  required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String },
}, {timestamps: true});

export const Review = new mongoose.model('Review', reviewSchema);
