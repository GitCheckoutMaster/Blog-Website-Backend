import { Router } from "express";
import verifyJWT from "../middleware/auth.middleware.js";
import {
	createArticle,
	getArticle,
	updateArticle,
    deleteArticle,
	getArticles,
} from "../controllers/article.controller.js";
import upload from "../middleware/multer.middleware.js";

const articleRouter = Router();

articleRouter
	.route("/create-article")
	.post(verifyJWT, upload.single("featuredImage"), createArticle);
articleRouter.route("/update-article/:slug").post(verifyJWT, upload.single("featuredImage"), updateArticle);
articleRouter.route("/:slug").delete(verifyJWT, deleteArticle);
articleRouter.route("/get-articles/:userid?").get(verifyJWT, getArticles);
articleRouter.route("/:slug").get(verifyJWT, getArticle);

export default articleRouter;
