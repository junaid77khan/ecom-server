import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/AsyncHandler";
import { Category } from "../models/categories-model";

const getAllCategories = asyncHandler(async(req, res) => {
    const allCategories = await Category.aggregate([
        {
            $match: {

            }
            
        },
    ])

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
    .json(new ApiResponse(200, {"Categories" :allCategories[0]}, "Categories Data fetched successfully"));
})

export {getAllCategories}