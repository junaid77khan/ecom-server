
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { Contact } from "../models/contact-model.js";
import { isValidObjectId } from "mongoose";

const addMessage = asyncHandler(async(req, res) => {
    let {name, email, message} = req.body;
    console.log(req.body);

    if(!name || !email || !message) {
        throw new ApiError(400, "Invalid data received");
    }

    const createMessage = await Contact.create({
        name,
        email,
        message
    });

    if(!createMessage) {
        throw new ApiError(500, "Something went wrong while adding message")
    }

    return res
        .json(new ApiResponse(200, createMessage, "Message added!!"));
})

const getMessages  = asyncHandler(async(req, res) => {

    const user = req?.user;

    if(!user || !user?.isAdmin) {
        return res.status(403).json({
            error: "Unauthorized access",
            message: "Access to this resource is restricted to administrators only"
        });
    }

    const messages = await Contact.find({})

    if(!messages) {
        throw new ApiError(400, "Something went wrong while fetching messages")
    }

    return res
        .json(new ApiResponse(200, messages, "Message Fetched!!"));
})

const deleteMessages = asyncHandler(async(req, res) => {

    const {messageId} = req.params;

    const user = req.user;
    
    if(!user.isAdmin) {
        return res
        .status(403)
        .json(new ApiResponse(403, {}, "Unauthorized access"));
    }

    if(!messageId || !isValidObjectId(messageId)) {
        throw new ApiError(400, "Invalid message Id");
    }

    const response = await Contact.findByIdAndDelete(messageId)

    if(!response) {
        throw new ApiError(400, "Something went wrong while deleting message")
    }

    return res
        .json(new ApiResponse(200, response, "Message deleted!!"));
})



export {addMessage, getMessages, deleteMessages}