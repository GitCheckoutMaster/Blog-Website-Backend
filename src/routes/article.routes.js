import { Router } from "express";
import verifyJWT from "../middleware/auth.middleware.js";
import { createArticle, getArticle } from "../controllers/article.controller.js";
import upload from "../middleware/multer.middleware.js";

const articleRouter = Router();

articleRouter.route("/create-article").post(verifyJWT, upload.single("featuredImage"), createArticle);
articleRouter.route("/:slug").get(verifyJWT, getArticle);

export default articleRouter;
