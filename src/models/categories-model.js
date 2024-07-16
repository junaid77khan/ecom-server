import mongoose, {Schema} from "mongoose";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { Product } from "./product-model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { destroyOnCloudinary } from "../utils/cloudinary.js";

const categorySchema = new Schema(
    {
        name: { 
            type: String,
            required: true
        },

        description: { 
            type: String,
        },

        image: {
            type: String,
            required: true
        },

        products: [
            {
                type: Schema.Types.ObjectId,
                ref: "Product"
            }
        ]
    }, {timestamps: true}
);

export const Category = new mongoose.model('Category', categorySchema);
