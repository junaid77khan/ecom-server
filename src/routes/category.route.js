import { Router } from "express";
import { getAllCategories, addCategory, deleteCategory, updateCategory } from "../controllers/category.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middlware.js";

const router = Router()

router.route("/all-categories").get(getAllCategories);

router.route("/add-category").post(
    // verifyJWT,
    upload.fields([
        {
            name: "image",
            maxCount: 1
        }
    ]),
    addCategory
)

router.route("/delete-category/:categoryId").get(
    verifyJWT,
    deleteCategory
)

router.route("/update-category/:categoryId").post(
    verifyJWT,
    upload.fields([
        {
            name: "image",
            maxCount: 1
        }
    ]),
    updateCategory
)

export default router