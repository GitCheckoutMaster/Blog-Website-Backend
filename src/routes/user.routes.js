import { Router } from "express";
import {
	registerUser,
	loginUser,
	logoutUser,
	generateNewAccessToken,
	getCurrentUser,
} from "../controllers/user.controller.js";
import upload from "../middleware/multer.middleware.js";
import verifyJWT from "../middleware/auth.middleware.js";

const userRouter = Router();

userRouter.route("/register").post(upload.single("avatar"), registerUser);
userRouter.route("/login").post(loginUser);
userRouter.route("/new-access-token").post(generateNewAccessToken);

// authenticated routes
userRouter.route("/logout").post(verifyJWT, logoutUser);
userRouter.route("/get-user").get(verifyJWT, getCurrentUser);

export default userRouter;
