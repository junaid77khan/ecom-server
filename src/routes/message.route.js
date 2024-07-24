import { Router } from "express";
import { addMessage, deleteMessages, getMessages } from "../controllers/message.controller.js";
import { verifyJWT } from "../middlewares/auth.middlware.js";

const router = Router()

router.route("/add-message").post(
    addMessage
);

router.route("/get-messages").get(
    verifyJWT,
    getMessages
);

router.route("/delete-message/:messageId").get(
    verifyJWT,
    deleteMessages
)

export default router