import { Router } from "express";
import { addProductInCart, getAllCartProducts, removeProductFromCart, updateProductQuantity } from "../controllers/cart.controller.js";
import { verifyJWT } from "../middlewares/auth.middlware.js";

const router = Router()

router.route("/add-cart-product/:productId").post(
    verifyJWT,
    addProductInCart
)

router.route("/cart-products").get(
    verifyJWT,
    getAllCartProducts
)

router.route("/remove-cart-product/:productId").get(
    verifyJWT,
    removeProductFromCart
)

router.route("/update-product-quantity/:productId").post(
    verifyJWT,
    updateProductQuantity
)

export default router