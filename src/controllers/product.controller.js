import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { Category } from "../models/categories-model.js";
import { Product } from "../models/product-model.js";
import { ProductSchema } from "../schemas/productSchema.js";
import { uploadOnCloudinary, destroyOnCloudinary } from "../utils/cloudinary.js";
import mongoose, { isValidObjectId } from "mongoose";
import fs from 'fs';              

const getProductByCategory = asyncHandler(async(req, res) => {
    const { categoryId } = req.body;

    if(!categoryId || !isValidObjectId(categoryId)) {
        return res.json(new ApiResponse(200, "Category Id is empty or invalid"));
    }

    // await Category.findById({_id: categoryId}).populate('products');
    const products = await Product.aggregate([
        {
          $match: {
            category: new mongoose.Types.ObjectId(categoryId)
          }
        }
      ]);

    if(!products) {
        throw new ApiError(400, "Something went wrong while fetching product data");
    }

    return res.json(
        new ApiResponse(200, products, "Product data fetched successfully")
    );
})

const addProduct = asyncHandler(async(req, res) => {
    const user = req?.user;

    if(!user || !user?.isAdmin) {
        return res.status(403).json({
            error: "Unauthorized access",
            message: "Access to this resource is restricted to administrators only"
        });
    }

    let {name, description, features, specifications, price, stock, categoryId, offer} = req.body;
    const imagesArr = req.files.images;

    if(!name || !description || !features || !specifications || !price || !stock || !categoryId) {
        imagesArr?.forEach((imageEle) => {
            fs.unlinkSync(imageEle.path)
        })
        throw new ApiError(404, "Please provide data of required fields");
    }

    if(!isValidObjectId(categoryId)) {
        imagesArr?.forEach((imageEle) => {
            fs.unlinkSync(imageEle.path)
        })
        throw new ApiError(400, "Category Id is invalid")
    }

    categoryId = new mongoose.Types.ObjectId(categoryId);

    const category = await Category.findById({_id: categoryId});

    if(!category) {
        imagesArr?.forEach((imageEle) => {
            fs.unlinkSync(imageEle.path)
        })
        return res
        .json(new ApiResponse(200, "Category not fount"))
    }

    if(imagesArr.length !== 3) {
        imagesArr?.forEach((imageEle) => {
            fs.unlinkSync(imageEle.path)
        })
        throw new ApiError(404, "Please provide exact 3 images of product");
    }

    features = JSON.parse(features)
    specifications = JSON.parse(specifications);
    price = Number(price);
    stock = Number(stock);
    if(offer) {
        offer = Number(offer)
    }

    const images = imagesArr.map(file => file.path);
    
    const validation = ProductSchema.safeParse({
        name, 
        description, 
        features,
        specifications,
        price, 
        stock, 
        images,
        offer: offer ? offer : null,
    })

    if (!validation.success) {
        imagesArr?.forEach((imageEle) => {
            fs.unlinkSync(imageEle.path)
        })
        const {
          name,
          description,
          features,
          specifications,
          price,
          unitsSold,
          stock,
          category,
          images,
          offer,
          ratingsReviews,
          availability,
        } = validation.error.format();
      
        return res.status(400).json({
          error: "Validation error",
          details: {
            name: name?._errors[0] || "",
            description: description?._errors[0] || "",
            features: features?._errors[0] || "",
            specifications: specifications?._errors[0] || "",
            price: price?._errors[0] || "",
            unitsSold: unitsSold?._errors[0] || "",
            stock: stock?._errors[0] || "",
            category: category?._errors[0] || "",
            images: images?._errors[0] || "",
            offer: offer?._errors[0] || "",
            ratingsReviews: ratingsReviews?._errors[0] || "",
            availability: availability?._errors[0] || "",
          },
        });
    }

    // const cloudinaryResponse1 = await uploadOnCloudinary(images[0]);
    // const cloudinaryResponse2 = await uploadOnCloudinary(images[1]);
    // const cloudinaryResponse3 = await uploadOnCloudinary(images[2]);

    // console.log("Cloudinary response", cloudinaryResponse1, " ", cloudinaryResponse2, " ", cloudinaryResponse3);
      
    // if(!cloudinaryResponse1 || !cloudinaryResponse2 || !cloudinaryResponse3) {
    //     throw new ApiError("Something went wrong while uploading images on cloudinary")
    // }

    // const cloudinaryImagesURL = [cloudinaryResponse1.url, cloudinaryResponse2.url, cloudinaryResponse3.url];

    // const product = await Product.create({
    //     name,
    //     description,
    //     features,
    //     specifications,
    //     price,
    //     stock,
    //     categoryId,
    //     images: cloudinaryImagesURL,
    //     offer: offer ? offer:null,

    // });

    // category.products.push(product._id);
    // await category.save();

    // if(!product) {
    //     throw new ApiError(500, "Something went wrong while adding product");
    // }

    return res
    .json(new ApiResponse(200, {name, description, features, specifications, price, stock, category, images}, "Data fetched"));
})

export {getProductByCategory, addProduct}