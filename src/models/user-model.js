import mongoose, {Schema} from "mongoose"; 
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

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

    verifyCode: {
        type: String,
        required: [true, "verifyCode is required"],
    },

    verifyCodeExpiry: {
        type: Date,
        required: [true, "verify code expiry is required"],
    },

    isVerified: {
        type: Boolean,
        default: false
    },

    refreshToken: {
        type: String
    },
}, {timestamps: true});

// Encrypt the password whenever password changes
userSchema.pre("save", async function(next) {
    if( !this.isModified("password") ) return next();

    try {
        this.password = await bcrypt.hash(this.password, 10);
        return next();
    } catch (error) {
        return next(error)
    }
})

// Validate Password
userSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password, this.password)
}

// generate-access-token - it is fast, No async-await
userSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        {
            _id: this._id,
            username: this.username,
            fullName: this.fullName,
            email: this.email
        }, 
        
        process.env.ACCESS_TOKEN_SECRET,

        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

// generate-refresh-token - it is fast, No async-await
userSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
        {
            _id: this._id
        }, 
        
        process.env.REFRESH_TOKEN_SECRET,

        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = new mongoose.model('User', userSchema);