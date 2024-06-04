import mongoose from "mongoose";

const likesSchema = new mongoose.Schema(
    {
        articleId: {
            type: String,
            required: true,
        },
        userId: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

export const Likes = mongoose.model("Likes", likesSchema);
