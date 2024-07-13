import { Router } from "express";
import { getProductByCategory, addProduct } from "../controllers/product.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middlware.js";

const router = Router()

router.route("/product-by-category").post(getProductByCategory);

router.route("/add-product").post(
    verifyJWT,
    upload.fields([
        {
            name: "images",
            maxCount: 3
        }
    ]),
    addProduct
)

export default router