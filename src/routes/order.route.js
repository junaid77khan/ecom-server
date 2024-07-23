import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlware.js";
import { addOrder, deleteOrder,allOrders } from "../controllers/order.controller.js";

const router = Router()

router.route("/add-order").post(
    addOrder
);

router.route("/delete-order/:orderId").get(
    verifyJWT,
    deleteOrder
);

router.route("/all-orders").get(
    // verifyJWT,
    allOrders
);


export default router