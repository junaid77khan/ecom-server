import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user-model.js";
import { signupSchema } from "../schemas/signupSchema.js";
import bcrypt from 'bcrypt';
import {z} from 'zod';
import { usernameValidation } from "../schemas/signupSchema.js";
import { verifySchema } from "../schemas/verifySchema.js";
import { generateAccessAndRefreshTken } from "../utils/authUtils.js";
import { sendVerificationEmail } from "../helpers/sendVerificationEmail.js";

const UsernameSchema = z.object({
    username: usernameValidation,
});


const signup = asyncHandler( async(req, res) => {
    let {username, email, password} = req.body;

    const validation = signupSchema.safeParse(req.body);

    if(!validation.success) {
        const usernameErrors = validation.error.format().username?._errors || [];
        const emailErrors = validation.error.format().email?._errors || [];
        const passwordErrors = validation.error.format().password?._errors || [];

        return res
        .status(400)
        .json(
            new ApiResponse(
                400,
                {
                    "usernameError": `${usernameErrors?.length > 0 ? `${usernameErrors[0]}` : ""}`,
                    "emailError": `${emailErrors?.length > 0 ? `${emailErrors[0]}` : ""}`,
                    "passwordError": `${passwordErrors?.length > 0 ? `${passwordErrors[0]}` : ""}`,
                },
            )
        )
    }

        
        if(
            [username, email, password].some( (field) => field?.trim === "" )
        ) {
    
            return res
            .status(400)
            .json(
                new ApiResponse(
                    400,
                    {
                        "usernameError": `${username?.trim === "" ? "Username is required" : ""}`,
                        "emailError": `${email?.trim === "" ? "Email is required" : ""}`,
                        "passwordError": `${password?.trim === "" ? "Password is required" : ""}`,
                    },
                )
            )
        }

    
    username = username.toLowerCase();
    const existingVerifiedUserByUsername = await User.findOne({
        username,
        isVerified: true
    })

    if(existingVerifiedUserByUsername) {
        return res
        .status(400)
        .json(
            new ApiResponse(400, {"usernameError": "username is taken"}, "Signup failed")
        )
    }

    const existingUserByEmail = await User.findOne({email});

    const verifyCode = Math.floor(100000 + (Math.random()*900000)).toString();

    if(existingUserByEmail) {
        if(existingUserByEmail.isVerified) {
            return res
            .status(400)
            .json(
                new ApiResponse(400, {"emailError": "email is taken"}, "Signup failed")
            )
        } 

        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + 1);

        existingUserByEmail.username = username;
        existingUserByEmail.password = password;
        existingUserByEmail.verifyCode = verifyCode;
        existingUserByEmail.verifyCodeExpiry = expiryDate;
   
        await existingUserByEmail.save();
    } else {
        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + 1);

        const existingNotVerifiedUserByUsername = await User.findOne({
            username,
            isVerified: false
        })
    
        if(existingNotVerifiedUserByUsername) {
            existingNotVerifiedUserByUsername.email = email;
            existingNotVerifiedUserByUsername.password = password;
            existingNotVerifiedUserByUsername.verifyCode = verifyCode;
            existingNotVerifiedUserByUsername.verifyCodeExpiry = expiryDate;

            await existingNotVerifiedUserByUsername.save();
        } else {
            await User.create({
                username,
                email,
                password,
                verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
            })
        }
    }

    const user = await User.find({email})
    
    const verificationEmailResponse = await sendVerificationEmail(
        email,
        username,
        verifyCode
    )

    if(!verificationEmailResponse) {
        return res
        .status(500)
        .json(
            new ApiResponse(500, verificationEmailResponse.response)
        )
    }

    return res
    .status(200)
    .json(new ApiResponse(200, user, "User registered successfully, Please verify your account"));
} )

const sendVerificationCode = asyncHandler(async(req, res) => {
    const {username} = req.body;

    if(!username) {
        throw new ApiError(404, "Email or username not received");
    }

    const user = User.find({username});

    if(!user) {
        throw new ApiError(404, "User not found");
    }
    const verifyCode = Math.floor(100000 + (Math.random()*900000)).toString();

    const verificationEmailResponse = await sendVerificationEmail(
        email= user[0].email,
        username,
        verifyCode
    )

    if(!verificationEmailResponse) {
        return res
        .status(500)
        .json(
            new ApiResponse(500, verificationEmailResponse.response)
        )
    }

    return res
    .status(200)
    .json(new ApiResponse(200, "Verification code sent successfully"));
})

const verifyCode = asyncHandler(async(req, res) => {
        let { code, username } = req.body;

        const usernameValidationResult = UsernameSchema.safeParse({ username });
        const codeValidationResult = verifySchema.safeParse({ code });

        if (!usernameValidationResult.success) {
            const usernameErrors = usernameValidationResult.error.format().username?._errors[0] || [];
            throw new ApiError(400, {message: usernameErrors?.length > 0 ? usernameErrors.join(', ') : "Invalid username"})
        }

        if (!codeValidationResult.success) {
            console.log(codeValidationResult.error.format().code);
            const codeErrors = codeValidationResult.error.format().code?._errors || [];
            throw new ApiError(400, {message: codeErrors?.length > 0 ? codeErrors.join(', ') : "Invalid code"})
        }

        const validUsername = usernameValidationResult.data.username;
        const validCode = codeValidationResult.data.code;

        const user = await User.findOne({ username: validUsername });

        if (!user) {
            throw new ApiError(404, "User not found")
        }

        const isCodeValid = (user.verifyCode === validCode);
        const expiryDate = new Date(user.verifyCodeExpiry);
        if (isNaN(expiryDate)) {
            throw new ApiError(404, "Something went wrong")
        }
        const isCodeNotExpired = (new Date(expiryDate) >= new Date());

        if (isCodeValid && isCodeNotExpired) {
            const {accessToken, refreshToken} = await generateAccessAndRefreshTken({userId: user._id});

            const options = {
                httpOnly: true,
                secure: true,
                expires: new Date(Date.now() + 25892000000),
                sameSite: 'None',
            }

            user.isVerified = true;
            await user.save();

            const updatedUser = await User.findById({_id: user._id}).select("-password -verifycode -verifyCodeExpiry -refreshToken");

    
            return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        updatedUser, refreshToken, accessToken
                    },
                    "User account verified successfully"
                )
            )
        }

        if(!isCodeValid) {
            return res.json(
               new ApiResponse(400, {message: "Verfication code is incorrect. Please enter correct code"})
            )
        }

        if(!isCodeNotExpired) {
            return res.json(
                new ApiResponse(400, {message: "Your verification code is expired. Please signup again to get a new code"})
            )
        }
})

const signin = asyncHandler(async(req, res) => {
    let{email, password} = req.body;

    if(!email) {
        return res
            .status(400)
            .json(
                new ApiResponse(
                    400,
                    {
                        "emailError": `Email or username is required`,
                    },
                )
            )
    }

    if(!password) {
        return res
            .status(400)
            .json(
                new ApiResponse(
                    400,
                    {
                        "emailError": `Passowrd is required`,
                    },
                )
            )
    }

    let user = await User.findOne(
        {"email": email}
    );

    if(!user) {
        user = await User.findOne(
            {"username": email}
        );
    }

    if(!user) {
        return res
        .status(400)
        .json(
            new ApiResponse(
                400,
                {
                    "emailError": "User not found",
                },
            )
        )
    }

    
    if(!user.isVerified) {
        return res
        .status(400)
        .json(
            new ApiResponse(
                400,
                {
                    "emailError": "Account is not verified",
                },
            )
        )
    }
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if(!isPasswordValid) {
        return res
        .status(400)
        .json(
            new ApiResponse(
                400,
                {
                    "emailError": "Credentials are wrong"
                },
            )
        )
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTken({userId: user._id})

    const loggedInUser = await User.findById(user._id)
    .select("-password -refreshToken -verifyCode -verifyCodeExpiry");

    const options = {
        httpOnly: true,
        secure: true,
        expires: new Date(Date.now() + 25892000000),
        sameSite: 'None',
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, refreshToken, accessToken
            },
            "User logged in successfully"
        )
    )
})

const refreshAccessToken = asyncHandler( async(req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken._id)
    
        if(!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if(user?.refreshToken !== incomingRefreshToken) {
            throw new ApiError(401, "Refresh Token is Expired or used")
        }
    
        const{accessToken, newRefreshToken} = await generateAccessAndRefreshTken(user._id)
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse( 
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Refresh token is refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error.message || "Invalid refresh token")
    }

} )

const logout = asyncHandler( async(req, res) => {
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken:1 
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(
            200, user, "User logout succesfully"
        )
    )
} )

const isUserLoggedIn = asyncHandler( async(req, res) => {
    const token = req.cookies.accessToken
    let isAuthenticated = false;
    if(token) {
        isAuthenticated = true;
    }

    return res
    .status(200)
    .json(new ApiResponse(200, {"isAuthenticated": isAuthenticated}, "Data fetched successfully"));
} )  

export {signup, sendVerificationCode, verifyCode, signin, refreshAccessToken, logout, isUserLoggedIn};