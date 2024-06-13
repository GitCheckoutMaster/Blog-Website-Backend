import asyncHandler from "../utils/asyncHandler.js";
import { Articles } from "../models/articles.model.js";
import { uploadOnCloudinary, deleteOnCloudinary } from "../utils/cloudinary.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse  from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { ObjectId } from "mongodb";

const createArticle = asyncHandler(async (req, res) => {
    const { content, title, slug, status } = req.body;
    const featuredImage = req.file?.path;

    if (!content || !title || !slug || !featuredImage) {
        throw new ApiError(401, "Missing required fields");
    }
    if (!status) {
        status = "inactive";
    }

    const imageUrl = await uploadOnCloudinary(featuredImage);
    if (!imageUrl) {
        throw new ApiError(500, "Failed to upload image");
    }

    const isArticleExists = await Articles.aggregate([
        {
            $match: { slug }
        }
    ])
    if (isArticleExists.length > 0) {
        throw new ApiError(400, "Article Exists");
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
    console.log("Article created successfully!");

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
    console.log("Article fetched successfully!");

    //todo 3: return the article
    return res
        .status(200)
        .json(
            new ApiResponse(200, article, "Article retrived successfully")
        );
});

// ran without error at one try
const updateArticle = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const { content, title, status } = req.body;
    const featuredImageLocation = req.file?.path;

    if (!content && !title && !slug) {
        throw new ApiError(400, "Missing required fields");
    }

    const article = await Articles.findOne({ slug });
    if (!article) {
        throw new ApiError(400, "Article not found!!");
    }

    let imageUrl = article.featuredImage;
    if (featuredImageLocation) {
        imageUrl = await uploadOnCloudinary(featuredImageLocation);
        await deleteOnCloudinary(article.featuredImage);
        if (!imageUrl) {
            throw new ApiError(500, "Failed to upload image");
        }
    }

    const updatedArticle = await Articles.updateOne({ slug }, {
        content: content || article.content,
        title: title || article.title,
        slug: slug || article.slug,
        status: status || article.status,
        featuredImage: imageUrl.url, 
    }).select("-userId");

    if (!updatedArticle) {
        throw new ApiError(500, "Failed to update article");
    }
    console.log("Article updated successfully!");

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedArticle, "Article updated successfully")
        );
});

// this one ran without error at one try too
const deleteArticle = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    if (!slug) {
        throw new ApiError(400, "Missing slug");
    }

    const article = await Articles.findOneAndDelete({ slug });
    if (!article) {
        throw new ApiError(404, "Article not found");
    }
    console.log("Article deleted successfully");

    return res
        .status(200)
        .json(
            new ApiResponse(200, article, "Article deleted successfully")
        );
});

const getArticles = asyncHandler(async (req, res) => {
    const {userid} = req.params;
    if (!userid) {
        const articles = await Articles.find();
        if (!articles) {
            throw new ApiError(404, "Articles not found");
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, articles, "All articles retrieved successfully")
            );
    }

    const isUser = await User.findOne({ _id: new ObjectId(userid) });
    if (!isUser) {
        throw new ApiError(404, "User not found");
    }

    const articles = await Articles.aggregate([
        {
            $match: {
                userid: userid,
                status: "active",
            }
        }
    ]);
    if (!articles) {
        throw new ApiError(404, "Articles not found");
    }
    console.log("All articles are retrived successfully!");

    return res
        .status(200)
        .json(
            new ApiResponse(200, articles, "Articles retrieved successfully")
        );
});

export { createArticle, getArticle, updateArticle, deleteArticle, getArticles };
