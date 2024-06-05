import asyncHandler from "../utils/asyncHandler.js";
import { Articles } from "../models/articles.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse  from "../utils/ApiResponse.js";

const createArticle = asyncHandler(async (req, res) => {
    const { content, title, slug, status } = req.body;
    const featuredImage = req.file.path;

    if (!content || !title || !slug || !featuredImage) {
        throw new ApiError(400, "Missing required fields");
    }
    if (!status) {
        status = "inactive";
    }

    const imageUrl = await uploadOnCloudinary(featuredImage);
    if (!imageUrl) {
        throw new ApiError(500, "Failed to upload image");
    }

    const article = await Articles.create({
        content,
        title,
        slug, 
        status,
        featuredImage: imageUrl.url,
        userid: req.user._id,
    });

    if (!article) {
        throw new ApiError(500, "Failed to create article");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, article, "Article created successfully")
        );
});

const getArticle = asyncHandler(async (req, res) => {
    //todo 1: get the slug of the article
    const { slug } = req.params;
    if (!slug) {
        throw new ApiError(400, "Missing slug");
    }

    //todo 2: find the article using the slug
    const article = await Articles.findOne({ slug });
    if (!article) {
        throw new ApiError(404, "Article not found");
    }

    //todo 3: return the article
    return res
        .status(200)
        .json(
            new ApiResponse(200, article, "Article retrived successfully")
        );
});

export { createArticle, getArticle };
