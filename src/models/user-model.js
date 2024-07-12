import mongoose, {Schema} from "mongoose";
import { boolean } from "zod";

const userSchema = new Schema({
    username: {
        type: String,
        required: [true, "Username is required"],
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },

    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        trim: true
    },

    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },

    password: {
        type: String,
        required: [true, "Password is required"]
    },

    isAdmin: {
        type: Boolean,
        default: false
    },

    address: {
        address: {type: String},
        street: { type: String },
        city: { type: String },
        state: { type: String },
        postalCode: { type: String },
        country: { type: String }
    },
    phoneNumber: { type: String },

    refreshToken: {
        type: String
    },
}, {timestamps: true});

export const User = new mongoose.model('User', userSchema);