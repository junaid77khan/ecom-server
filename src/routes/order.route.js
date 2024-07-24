import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlware.js";
import { addOrder, deleteOrder,allOrders, allCodOrders, changeOrderStatus, deleteCODOrder } from "../controllers/order.controller.js";

const router = Router()

router.route("/add-order").post(
    addOrder
);

router.route("/delete-order/:orderId").get(
    deleteOrder
);

router.route("/all-orders").get(
    verifyJWT,
    allOrders
);

router.route("/all-cod-orders").get(
    verifyJWT,
    allCodOrders
);

router.route("/edit-order-status").post(
    verifyJWT,
    changeOrderStatus
);

router.route("/delete-COD-order/:orderId").get(
    verifyJWT,
    deleteCODOrder
);


export default router