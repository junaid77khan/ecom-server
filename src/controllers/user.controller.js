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


  const registerUser = asyncHandler( async(req, res) => {
    const {username, email, fullName, password} = req.body;

    const validation = signupSchema.safeParse(req.body);

    if(!validation.success) {
        const usernameErrors = validation.error.format().username?._errors || [];
        const fullNameErrors = validation.error.format().fullName?._errors || [];
        const emailErrors = validation.error.format().email?._errors || [];
        const passwordErrors = validation.error.format().password?._errors || [];
        // const allErrors = validation.error.format();

        return res
        .status(400)
        .json(
            new ApiResponse(
                400,
                {
                    "usernameError": `${usernameErrors?.length > 0 ? `${usernameErrors[0]}` : ""}`,
                    "fullNameError": `${fullNameErrors?.length > 0 ? `${fullNameErrors[0]}` : ""}`,
                    "emailError": `${emailErrors?.length > 0 ? `${emailErrors[0]}` : ""}`,
                    "passwordError": `${passwordErrors?.length > 0 ? `${passwordErrors[0]}` : ""}`,
                },
            )
        )
    }

        
        if(
            [username, email, fullName, password].some( (field) => field?.trim === "" )
        ) {
    
            return res
            .status(400)
            .json(
                new ApiResponse(
                    400,
                    {
                        "usernameError": `${username?.trim === "" ? "Username is required" : ""}`,
                        "fullNameError": `${fullName?.trim === "" ? "FullName is required" : ""}`,
                        "emailError": `${email?.trim === "" ? "Email is required" : ""}`,
                        "passwordError": `${password?.trim === "" ? "Password is required" : ""}`,
                    },
                )
            )
        }

    
    const existingVerifiedUserByUsername = await User.findOne({
        username,
        isVerified: true
    })

    if(existingVerifiedUserByUsername) {
        return res
        .status(400)
        .json(
            new ApiResponse(400, {}, "User already exists with this username")
        )
    }

    const existingUserByEmail = await User.findOne({email});

    const verifyCode = Math.floor(100000 + (Math.random()*900000)).toString();

    if(existingUserByEmail) {
        if(existingUserByEmail.isVerified) {
            return res
            .status(400)
            .json(
                new ApiResponse(400, {}, "User already exists with this email")
            )
        } 

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + 1);

        existingUserByEmail.password = hashedPassword;
        existingUserByEmail.verifyCode = verifyCode;
        existingUserByEmail.verifyCodeExpiry = expiryDate;
   
        await existingUserByEmail.save();
    } else {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + 1);

        await User.create({
            username,
            email,
            fullName,
            password: hashedPassword,
            verifyCode,
            verifyCodeExpiry: expiryDate,
            isVerified: false,
        })
    }

    const user = await User.find({email})

    const {accessToken, refreshToken} = await generateAccessAndRefreshTken({userId: user[0]._id});
    
    const createdUser = await User.find({_id: user._id}).select(
        "-password -refreshToken -verifyCode -verifyCodeExpiry" 
    );

    if(!createdUser) {
        return res
        .status(500)
        .json(new ApiResponse(500, {}, "Something went wrong while user registration"))
    }
    
    const verificationEmailResponse = await sendVerificationEmail(
        email,
        username,
        verifyCode
    )

    if(!verificationEmailResponse.success) {
        return res
        .status(500)
        .json(
            new ApiResponse(500, verificationEmailResponse.message)
        )
    }

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
                createdUser, refreshToken, accessToken
            },
            "User registered successfully"
        )
    )

} )

const verifyCode = asyncHandler(async(req, res) => {
        const { username, code } = req.body;

        const usernameValidationResult = UsernameSchema.safeParse({ username });
        const codeValidationResult = verifySchema.safeParse({ code });

        console.log(usernameValidationResult); // TODO: Remove
        console.log(codeValidationResult);

        if (!usernameValidationResult.success) {
            const usernameErrors = usernameValidationResult.error.format().username?._errors || [];
            return res
            .status(400)
            .json(
               new ApiResponse(400, {message: usernameErrors?.length > 0 ? usernameErrors.join(', ') : "Invalid username"})
            );
        }

        if (!codeValidationResult.success) {
            const codeErrors = codeValidationResult.error.format().code?._errors || [];
            return res.json(
                new ApiResponse(400, {message: codeErrors?.length > 0 ? codeErrors.join(', ') : "Invalid code"})
            );
        }

        const validUsername = usernameValidationResult.data.username;
        const validCode = codeValidationResult.data.code;

        const decodedUsername = decodeURIComponent(validUsername); 

        const user = await User.findOne({ username: decodedUsername });

        if (!user) {
            return Response.json(
                {
                    success: false,
                    message: "Username not found"
                },
                {
                    status: 400
                }
            );
        }

        const isCodeValid = (user.verifyCode === validCode);
        const isCodeNotExpired = (new Date(user.verifyCodeExpiry) > new Date());

        if (isCodeValid && isCodeNotExpired) {
            user.isVerified = true;
            await user.save();
            return res
            .status(200)
            .json(
                new ApiResponse(200, {message: "Your account is verified successfully"})
            );
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

export {registerUser, verifyCode};