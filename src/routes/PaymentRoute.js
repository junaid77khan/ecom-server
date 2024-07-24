import express from "express";
import { checkout, paymentVerification, addRazorPayPaymentSuccess, getAllRazorPayOrdersBYId, deleteRazorPayOrder } from '../controllers/PaymentController.js';
import { verifyJWT } from "../middlewares/auth.middlware.js";

const router = express.Router();

router.route("/checkout").post(checkout);

router.route("/paymentverification").post(paymentVerification);

router.route("/payment/add-payment-details").post(addRazorPayPaymentSuccess);

router.route("/payment/get-razorpay-orders").get(
    verifyJWT,
    getAllRazorPayOrdersBYId
);


router.route("/payment/delete-RazorPay-order/:orderId").get(
    verifyJWT,
    deleteRazorPayOrder
);

export default router;