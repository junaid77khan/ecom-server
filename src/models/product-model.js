import mongoose, {Schema} from "mongoose"

const productSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    stock: { type: Number, required: true },
    images: [String],
    reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
}, {timestamps: true});

export const Product = new mongoose.model('Product', productSchema);
