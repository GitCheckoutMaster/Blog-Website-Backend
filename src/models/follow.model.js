import mongoose from "mongoose";

const followeSchema = new mongoose.Schema(
    {
        follower: {
            type: String,
            required: true,
        },
        following: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

export const Follow = mongoose.model("Follow", followeSchema);
