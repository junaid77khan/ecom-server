import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user-model.js";
import { Product } from "../models/product-model.js";
import { Cart } from "../models/cart-model.js";
import {z} from 'zod';

const addProductInCart = asyncHandler(async(req, res) => {
    const{productId} = req.params;
    let{quantity} = req.body;
    if(!productId || !isValidObjectId(productId)) {
        throw new ApiError(400, "Product Id is not valid or it is null");
    }
    const product = await Product.findById({_id: productId});

    if(!product) {
        return res
        .status(200)
        .json(new ApiResponse(200, "No product found"));
    }

    const user = req.user;
    
    if(quantity) {
        quantity = Number(quantity)
    }

    const newItem = {
        product: product._id,
        quantity: quantity ? quantity : 1
    };

    let cart = await Cart.findOne({ user: user._id });

    if (!cart) {
        cart = await Cart.create({
            user: user._id,
            items: [newItem]
        });
    } else {
        const existingItemIndex = cart.items.findIndex(item => item.product.equals(product._id));

        if (existingItemIndex !== -1) {
            cart.items[existingItemIndex].quantity += newItem.quantity;
        } else {
            cart.items.push(newItem);
        }
        await cart.save();
    }

    res.status(200).json(new ApiResponse(200, "Product is added in cart successfully", cart));
})

const getAllCartProducts = asyncHandler( async(req, res) => {
    const user = req.user;

    const cartProducts = await Cart.findOne({user}).populate('items.product', '-updatedAt -createdAt');

    console.log(cartProducts);
    if(!cartProducts) {
        return res
        .status(500)
        .json(new ApiResponse(500, "Something went wrong during fetching data from database"));
    }

    if(cartProducts?.items?.length === 0) {
        return res
        .status(200)
        .json(new ApiResponse(200, "No products in cart"));
    }

    return res
        .status(200)
        .json(new ApiResponse(200, cartProducts, "Products in cart data fetched successfully"));
})

const removeProductFromCart = asyncHandler(async(req, res) => {
    const {productId} = req.params; 

    if(!productId || !isValidObjectId(productId)) {
        throw new ApiError(400, "Product Id is not valid or it is null");
    }

    const user = req.user;

    let cart = await Cart.findOne({user});

    if(!cart) {
        return res
        .status(200)
        .json(new ApiResponse(200, "No cart found"));
    }

    const updatedItems = cart.items.filter((item) => item.product.toString() !== productId.toString());

    cart.items = updatedItems;

    await cart.save();

    return res
        .status(200)
        .json(new ApiResponse(200, "Product removed from cart"));
})

const updateProductQuantity = asyncHandler(async(req, res) => {
    const {productId} = req.params;
    const{quantity} = req.body;

    if(!productId || !isValidObjectId(productId)) {
        throw new ApiError(400, "Product Id is not valid or it is null");
    }

    if(!quantity) {
        throw new ApiError(400, "Product quantity is required");
    }

    const user = req.user;

    let cart = await Cart.findOne({user});

    if(!cart) {
        return res
        .status(200)
        .json(new ApiResponse(200, "No cart found"));
    }

    const index = cart.items.findIndex(item => item.product.toString() === productId.toString());

    if (index !== -1) {
        cart.items[index].quantity = quantity;
        await cart.save();
    } else {
        return res
        .status(200)
        .json(new ApiResponse(200, "No product found in cart"));
    }

    return res
        .status(200)
        .json(new ApiResponse(200, "Product quantity updated"));
})

export {addProductInCart, getAllCartProducts, removeProductFromCart, updateProductQuantity}