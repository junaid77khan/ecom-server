import mongoose, {Schema} from "mongoose";

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
