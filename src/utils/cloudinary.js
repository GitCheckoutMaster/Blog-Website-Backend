import { v2 as cloudinary } from "cloudinary";
import ApiError from "./ApiError.js";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (path) => {
    try {
        if (!path) {
            throw new ApiError(400, "Path is required");
        }
        const result = await cloudinary.uploader.upload(path);
        fs.unlinkSync(path);

        return result;
    } catch (error) {
        throw new ApiError(500, error.message);
    }
}

const deleteOnCloudinary = async (url) => {
    const publicId = url.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(publicId).catch(error => {
        throw new ApiError(500, "Error while deleteing file on cloudinary: " + error.message);
    }); 
}

export { uploadOnCloudinary, deleteOnCloudinary };
