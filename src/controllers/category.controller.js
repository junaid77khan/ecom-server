import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { Category } from "../models/categories-model.js";
import { categorySchema } from "../schemas/categorySchema.js";
import { uploadOnCloudinary, destroyOnCloudinary } from "../utils/cloudinary.js";
import { isValidObjectId } from "mongoose";
import { Product } from "../models/product-model.js";
import { Cart } from "../models/cart-model.js";
import { ParseStatus } from "zod";

const getAllCategories = asyncHandler(async(req, res) => {
    let { page = 1, limit = 10, query, sortType="asc" } = req.query
    page = isNaN(page) ? 1 : Number(page);
    limit = isNaN(limit) ? 10 : Number(limit);

    if(page <= 0){
        page = 1;
    }
    if(limit <= 0){
        limit = 10;
    }
    let pipeline = []

    pipeline.push(

        {
            $match: {

            }
            
        },

        {
            $sort: {
                name:  sortType === 'asc' ? 1 : -1
            }
        },

        { $skip: ( (page-1) * limit ) },

        { $limit: limit }
    )

    const allCategories = await Category.aggregate(pipeline);

    if(!allCategories) {
        throw new ApiError(400, "Something went wrong while fetching catogries data");
    }

    if(allCategories?.length == 0) {
        return res
        .status(200)
        .json(new ApiResponse(200, "No categories available"))
    }

    return res
    .status(200)
    .json(new ApiResponse(200, allCategories, "Categories Data fetched successfully"));
})

const addCategory = asyncHandler( async(req, res) => {
    const user = req?.user;

    if(!user || !user?.isAdmin) {
        return res.status(403).json({
            error: "Unauthorized access",
            message: "Access to this resource is restricted to administrators only"
        });
    }

    const{name, description} = req.body;
    const imageLocalPath = req.files?.image[0].path;

    const validation = categorySchema.safeParse({name, description, image: req.files});

    if (!validation.success) {
        const nameError = validation.error.format().name?._errors?.[0] || "";
        const descriptionError = validation.error.format().description?._errors?.[0] || "";
        const imageError = validation.error.format().image?._errors?.[0] || "";

        return res.status(400).json({
            error: "Validation error",
            details: {
                nameError,
                descriptionError,
                imageError
            }
        });
    }

    if ([name, imageLocalPath].some((field) => !field || field.trim() === "")) {
        return res.status(400).json({
            error: "Validation error",
            details: {
                nameError: name.trim() === "" ? "Name is required" : "",
                imageError: imageLocalPath.trim() === "" ? "Image is required" : ""
            }
        });
    }

    const existedCategoryName = await Category.findOne({name});

    if (existedCategoryName) {
        return res.status(409).json({
            error: "Conflict",
            message: "Category name already exists"
        });
    }

    const cloudinaryResponse = await uploadOnCloudinary(imageLocalPath);

    console.log("Cloudinary path", cloudinaryResponse);

    if(!cloudinaryResponse) {
        throw new ApiError("Something went wrong while uploading image on cloudinary")
    }

    const category = await Category.create({
        name,
        description: description ? description : "",
        image: cloudinaryResponse.url
    });

    if(!category) {
        throw new ApiError(500, "Something went wrong while adding category");
    }

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        category,
        "Category added successfulluy"
    ))
} )

const deleteCategory = asyncHandler(async(req, res) => {
    const user = req?.user;

    if(!user || !user?.isAdmin) {
        return res.status(403).json({
            error: "Unauthorized access",
            message: "Access to this resource is restricted to administrators only"
        });
    }

    const {categoryId} = req.params;
    // const {categoryId} = req.body;

    if(!categoryId?.trim() && isValidObjectId(categoryId)) {
        throw new ApiError(400, "Invalid category Id")
    }
    
    const category = await Category.findById({_id: categoryId})

    if(!category) {
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Category not found"))
    }

    let products = await Product.find({categoryId: category._id});

    products.forEach( async(product) => {
        // deleting all products from cart
        await Cart.updateMany(
            { 'items.product': product._id },
            { $pull: { items: { product: product._id } } }
        );

        // deleting product images
        await destroyOnCloudinary(product.images[0]);
        await destroyOnCloudinary(product.images[1]);
        await destroyOnCloudinary(product.images[2]);

        // delete product
        let response = await Product.findByIdAndDelete({_id: product._id});

        if(!response) {
            return res
            .status(500)
            .json(new ApiResponse(500, "Something went wrong while deleting product from database"));
        }
    })

    await destroyOnCloudinary(category.image);

    let response = await Category.findByIdAndDelete({_id: category._id});

    if(!response) {
        return res
        .status(500)
        .json(new ApiResponse(500, "Something went wrong while deleting category from database"));
    }

    return res
    .status(200)
    .json(new ApiResponse(200, response, "Category deleted successfully"))
})

const updateCategory = asyncHandler(async(req, res) => {
    const user = req?.user;

    if(!user || !user?.isAdmin) {
        return res.status(403).json({
            error: "Unauthorized access",
            message: "Access to this resource is restricted to administrators only"
        });
    }

    const { categoryId } = req.params
    const { name, description } = req.body
    const imageLocalPath = req.files?.image[0].path;

    if( !name && !description && !imageLocalPath) {
        throw new ApiError(404, "No updated data received")
    }
    
    const validation = categorySchema.safeParse({name, description, image: req.files});

    if (!validation.success) {
        const nameError = validation.error.format().name?._errors?.[0] || "";
        const descriptionError = validation.error.format().description?._errors?.[0] || "";
        const imageError = validation.error.format().image?._errors?.[0] || "";

        return res.status(400).json({
            error: "Validation error",
            details: {
                nameError,
                descriptionError,
                imageError
            }
        });
    }

    const category = await Category.findById(categoryId)

    if(!category) {
        throw new ApiError(404, "No Category exists")
    }

    const cloudinaryReponse = await uploadOnCloudinary(imageLocalPath)

    if(!cloudinaryReponse) {
        throw new ApiError(500, "Something went wrong while uploading thumbnail")
    }

    const oldImageUrl = category?.image;

    const updatedCategory = await Category.findByIdAndUpdate(
        categoryId,
        {
            $set: {
                ...(name && { name }), 
                ...(description && { description }),  
                ...(cloudinaryReponse && cloudinaryReponse.url && { image: cloudinaryReponse.url }),
            }
        },
        {new: true}
    )

    await destroyOnCloudinary(oldImageUrl);

    return res
    .status(200)
    .json(
        new ApiResponse(200, updateCategory, "Category details updated")
    )
})

export {getAllCategories, addCategory, deleteCategory, updateCategory}