import { Router } from "express";
import { getAllProducts, getProductByCategory, addProduct, deleteProduct, updateProduct, getProductById, getProductByPriceRangeOfPartCategory, addReviewInProduct, getReviewsOfProduct, mostPopularProducts, newItems, bestSeller} from "../controllers/product.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middlware.js";

const router = Router()

router.route("/all-products").get(getAllProducts);

router.route("/product-by-category/:categoryId").get(getProductByCategory);

router.route("/add-product").post(
    // verifyJWT,
    upload.fields([
        {
            name: "image1",
            maxCount: 1
        },
        {
            name: "image2",
            maxCount: 1
        },
        {
            name: "image3",
            maxCount: 1
        },
    ]),
    addProduct
)

router.route("/delete-product/:productId").get(
    // verifyJWT,
    deleteProduct
);

router.route("/update-product/:productId").post(
    // verifyJWT,
    upload.fields([
        {
            name: "image1",
            maxCount: 1
        },
        {
            name: "image2",
            maxCount: 1
        },
        {
            name: "image3",
            maxCount: 1
        },
    ])
    ,updateProduct);

router.route("/product-by-Id/:productId").get(getProductById);

router.route("/product-in-range-category").post(getProductByPriceRangeOfPartCategory);

router.route("/add-review").post(
    // verifyJWT,
    addReviewInProduct
);

router.route("/get-reviews/:productId").get(
    getReviewsOfProduct
);

router.route("/most-popular-products").get(mostPopularProducts);

router.route("/new-items").get(newItems);

router.route("/best-seller").get(bestSeller);

export default router