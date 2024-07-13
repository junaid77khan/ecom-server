import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { Category } from "../models/categories-model.js";
import { Product } from "../models/product-model.js";
import { nameSchema, ProductSchema } from "../schemas/productSchema.js";
import { uploadOnCloudinary, destroyOnCloudinary } from "../utils/cloudinary.js";
import mongoose, { isValidObjectId } from "mongoose";
import fs from 'fs'; 
import {z} from 'zod';

const deleteImages = (files) => {
    try {
        if (files['image1'] && files['image1'][0]) {
            const filePath = files['image1'][0].path;
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log(`Deleted ${filePath}`);
            } else {
                console.warn(`File ${filePath} not found`);
            }
        }

        if (files['image2'] && files['image2'][0]) {
            const filePath = files['image2'][0].path;
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log(`Deleted ${filePath}`);
            } else {
                console.warn(`File ${filePath} not found`);
            }
        }

        if (files['image3'] && files['image3'][0]) {
            const filePath = files['image3'][0].path;
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log(`Deleted ${filePath}`);
            } else {
                console.warn(`File ${filePath} not found`);
            }
        }
    } catch (err) {
        console.error('Error deleting files:', err);
    }
};

const getAllProducts = asyncHandler(async(req, res) => {
    const products = await Product
        .find({})
        .populate("categoryId")
        .sort({ createdAt: -1 });

    if(!products) {
        throw new ApiError(400, "Something went wrong while fetching product data");
    }

    if(products.length === 0) {
        return res.json(new ApiResponse(200, "No Products available"))
    }

    return res.json(new ApiResponse(200, products, "Products data found succesfully"))
})

const getProductByCategory = asyncHandler(async (req, res) => {
    const { categoryId } = req.body;
    let { page = 1, limit = 10, query, sortType = "dsc" } = req.query;
    page = isNaN(page) ? 1 : Number(page);
    limit = isNaN(limit) ? 10 : Number(limit);

    if (page <= 0) {
        page = 1;
    }
    if (limit <= 0) {
        limit = 10;
    }

    if (!categoryId || !isValidObjectId(categoryId)) {
        return res.json(new ApiResponse(200, "Category Id is empty or invalid"));
    }

    const products = await Product.aggregate([
        {
            $match: {
                category: new mongoose.Types.ObjectId(categoryId)
            }
        },
        {
            $sort: {
                createdAt: sortType === 'asc' ? 1 : -1 // Sort by createdAt field
            }
        },
        { $skip: (page - 1) * limit },
        { $limit: limit }
    ]);


    if (products.length === 0) {
        return res.json(new ApiResponse(200, "No products found for this category"));
    }

    return res.json(new ApiResponse(200, products, "Product data fetched successfully"));
});


const addProduct = asyncHandler(async(req, res) => {
    const user = req?.user;

    // if(!user || !user?.isAdmin) {
    //     return res.status(403).json({
    //         error: "Unauthorized access",
    //         message: "Access to this resource is restricted to administrators only"
    //     });
    // }

    let {name, description, features, specifications, price, stock, categoryId, offer} = req.body;
    const {files} = req;

    if(!name || !description || !features || !specifications || !price || !stock || !categoryId) {
        if(files) deleteImages(files)
        throw new ApiError(404, "Please provide data of required fields");
    }

    if(!isValidObjectId(categoryId)) {
        if(files) deleteImages(files)
        throw new ApiError(400, "Category Id is invalid")
    }

    categoryId = new mongoose.Types.ObjectId(categoryId);

    const category = await Category.findById({_id: categoryId});

    if(!category) {
        if(files) deleteImages(files)
        return res
        .json(new ApiResponse(200, "Category not fount"))
    }

    if(!files['image1'] || !files['image2'] || !files['image3']) {
        if(files) deleteImages(files)
        throw new ApiError(404, "Please provide exact 3 images of product");
    }

    features = JSON.parse(features)
    specifications = JSON.parse(specifications);
    price = Number(price);
    stock = Number(stock);
    if(offer) {
        offer = Number(offer)
    }
    
    const validation = ProductSchema.safeParse({
        name, 
        description, 
        features,
        specifications,
        price, 
        stock, 
        images: files,
        offer: offer ? offer : null,
    })

    if (!validation.success) {
        if(files) deleteImages(files)
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

    const cloudinaryResponse1 = await uploadOnCloudinary(files.image1[0].path);
    const cloudinaryResponse2 = await uploadOnCloudinary(files.image2[0].path);
    const cloudinaryResponse3 = await uploadOnCloudinary(files.image3[0].path);

    console.log("Cloudinary response", cloudinaryResponse1, " ", cloudinaryResponse2, " ", cloudinaryResponse3);
      
    if(!cloudinaryResponse1 || !cloudinaryResponse2 || !cloudinaryResponse3) {
        throw new ApiError("Something went wrong while uploading images on cloudinary")
    }

    const cloudinaryImagesURL = [cloudinaryResponse1.url, cloudinaryResponse2.url, cloudinaryResponse3.url];

    const product = await Product.create({
        name,
        description,
        features,
        specifications,
        price,
        stock,
        categoryId,
        images: cloudinaryImagesURL,
        offer: offer ? offer:null,

    });

    category.products.push(product._id);
    await category.save();

    if(!product) {
        throw new ApiError(500, "Something went wrong while adding product");
    }

    return res
    .json(new ApiResponse(200, product, "Product added succesfully"));
})

const deleteProduct = asyncHandler(async(req, res) => {
    const user = req?.user;

    // if(!user || !user?.isAdmin) {
    //     return res.status(403).json({
    //         error: "Unauthorized access",
    //         message: "Access to this resource is restricted to administrators only"
    //     });
    // }

    const {productId} = req.params;

    if(!productId?.trim() && isValidObjectId(productId)) {
        throw new ApiError(400, "Invalid product Id")
    }
    
    const product = await Product.findById(productId).populate('categoryId');

    if(!product) {
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Product not found"))
    }

    const category = product?.categoryId;

    if(category) {
        category.products = category.products.filter(p => p.toString() !== productId);

        await category.save();
    }

    destroyOnCloudinary(product.images[0]);
    destroyOnCloudinary(product.images[1]);
    destroyOnCloudinary(product.images[2]);

    const response = await Product.findByIdAndDelete({_id: productId});

    if(!response) {
        throw new ApiError(400, "Deletion of product failed")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Product deleted successfully"))
})

const updateProduct = asyncHandler(async(req, res) => {
    const user = req?.user;

    // if(!user || !user?.isAdmin) {
    //     return res.status(403).json({
    //         error: "Unauthorized access",
    //         message: "Access to this resource is restricted to administrators only"
    //     });
    // }

    let { productId } = req.params
    let { name, description, features, specifications, price, unitsSold, stock, categoryId, offer} = req.body
    let {files} = req;

    if(name && description && features && specifications && price && stock && categoryId) {
        if(!isValidObjectId(categoryId)) {
            if(files) deleteImages(files)
            throw new ApiError(400, "Category Id is invalid")
        }
    
        categoryId = new mongoose.Types.ObjectId(categoryId);
    
        const category = await Category.findById({_id: categoryId});
    
        if(!category) {
            if(files) deleteImages(files)
            return res
            .json(new ApiResponse(200, "Category not fount"))
        }
    
        features = JSON.parse(features)
        specifications = JSON.parse(specifications);
        price = Number(price);
        stock = Number(stock);
        if(offer) {
            offer = Number(offer)
        }
    
        const validation = ProductSchema.safeParse({
            name, 
            description, 
            features,
            specifications,
            price, 
            stock, 
            images: files,
            offer: offer ? offer : null,
        })

        if (!validation.success) {
            if(files) deleteImages(files)
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

        let product = await Product.findById({_id: productId});

        if(!product) {
            return res
            .json(new ApiResponse(200, {}, "No product found"))
        }
    
        if(files['image1']) {
            const response = destroyOnCloudinary(product.images[0]);
            if(!response) {
                return res.
                json(new ApiResponse(200, response, "Something went wrong while deleting images"))
            }
            const cloudinaryResponse = await uploadOnCloudinary(files.image1[0].path);
            if(!cloudinaryResponse) {
                throw new ApiError(400, "Something went wrong while uploading image")
            }
            const updatedArr = product.images.filter((image, idx) => idx !== 0);
            product.images = updatedArr;
            product.images.push(cloudinaryResponse.url);
            await product.save();
        }
        if(files['image2']) {
            const response = destroyOnCloudinary(product.images[1]);
            if(!response) {
                return res.
                json(new ApiResponse(200, response, "Something went wrong while deleting images"))
            }
            const cloudinaryResponse = await uploadOnCloudinary(files.image2[0].path);
            if(!cloudinaryResponse) {
                throw new ApiError(400, "Something went wrong while uploading image")
            }
            const updatedArr = product.images.filter((image, idx) => idx !== 1);
            product.images = updatedArr;
            product.images.push(cloudinaryResponse.url);
            await product.save();
        }
        if(files['image3']) {
            const response = destroyOnCloudinary(product.images[2]);
            if(!response) {
                return res.
                json(new ApiResponse(200, response, "Something went wrong while deleting images"))
            }
            const cloudinaryResponse = await uploadOnCloudinary(files.image3[0].path);
            if(!cloudinaryResponse) {
                throw new ApiError(400, "Something went wrong while uploading image")
            }
            const updatedArr = product.images.filter((image, idx) => idx !== 2);
            product.images = updatedArr;
            product.images.push(cloudinaryResponse.url);
            await product.save();
        }
    
        const updatedProduct = await Product.findByIdAndUpdate({_id: productId},{
            name,
            description,
            features,
            specifications,
            price,
            stock,
            categoryId,
            offer: offer ? offer:null,
        },{new: true});
    
        if(!updateProduct) {
            throw new ApiError(500, "Something went wrong while adding product");
        }
    
        return res
        .json(new ApiResponse(200, updateProduct, "Product updated succesfully"));
    }
    
})

export {getAllProducts, getProductByCategory, addProduct, deleteProduct, updateProduct}