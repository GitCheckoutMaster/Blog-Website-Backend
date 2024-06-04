import mongoose from "mongoose";

const commentsSchema = new mongoose.Schema(
    {
        articleId: {
            type: String,
            required: true,
        },
        userId: {
            type: String,
            required: true,
        },
        comment: {
            type: String,
            required: true,
        }
    },
    { timestamps: true }
);

export const Comments = mongoose.model("Comments", commentsSchema);
