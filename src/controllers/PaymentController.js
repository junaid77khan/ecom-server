import { instance } from "../../index.js";
import crypto from "crypto";
import { Payment } from "../models/PaymentModel.js";

export const checkout = async (req, res) => {
  const options = {
    amount: Number(req.body.amount * 100),
    currency: "INR",
  };
  const order = await instance.orders.create(options);

  res.status(200).json({
    success: true,
    order,
  });
};

export const paymentVerification = async (req, res) => {
  console.log(req.body);
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;
  console.log(req.body);

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", "ChsggKSAQkx7xs4hE0Fb37zh")
    .update(body.toString())
    .digest("hex");
  console.log(req.body);

  const isAuthentic = expectedSignature === razorpay_signature;
  console.log(req.body);

  if (isAuthentic) {
    // Database comes here
    console.log(req.body);

    await Payment.create({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });
    console.log(req.body);

    // res.redirect(
    //   `http://localhost:7000/paymentsuccess?reference=${razorpay_payment_id}`

    // );
    // console.log(req.body)

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const redirectUrl = `http://localhost:7000/checkout?reference=${razorpay_payment_id}&order_id=${razorpay_order_id}&signature=${razorpay_signature}`;

    res.redirect(redirectUrl);
    console.log(req.body);
  } else {
    res.status(400).json({
      success: false,
    });
  }
};
