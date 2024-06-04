import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import asyncHandler from '../utils/asyncHandler.js';

async function generateAccessAndRefreshTokens(userid) {
    try {
        const user = await User.findById(userid);
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        user.refreshToken = refreshToken;
        user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens. Error: " + error.message);
    }
}

const registerUser = async (req, res) => {
    try {
        const { email, password, name } = req.body;
        if (!email || !password || !name) {
            throw new ApiError(400, "Missing required fields");
        }
        
        // Check if user with email exists
        const userExists = await User.findOne({ email });
        
        const avatarPath = req.file?.path;
        if (!avatarPath) {
            throw new ApiError(400, "Avatar is required");
        }
        const avatarUrl = await uploadOnCloudinary(avatarPath);
        if (userExists) {
            throw new ApiError(400, "User with this email already exists");
        }
        if (!avatarUrl) {
            throw new ApiError(500, "Failed to upload avatar");
        }
        
        const newUser = await User.create({
            name: name,
            password: password,
            email: email,
            avatar: avatarUrl.url,
        });
        
        if (!newUser) {
            throw new ApiError(500, "Failed to create user");
        }
        
        const createdUser = await User.findById(newUser._id).select("-password -refreshToken");
        if (!createdUser) {
            throw new ApiError(500, "Failed to store user");
        }

        return res
            .status(200)
            .json(new ApiResponse(200, createdUser, "User created successfully"));
    } catch (error) {
        throw new ApiError(500, error.message);
    }
}

const loginUser = asyncHandler(async (req, res) => {
    //todo 1: get email and password from req.body
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Missing required fields");
    }

    //todo 2: check if user with email exists
    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    //todo 3: check if password is correct
    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
        throw new ApiError(404, "Password is wrong!");
    }

    //todo 4: generate access and refresh tokens and send response
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    return res
        .status(200)
        .cookie("refreshToken", refreshToken)
        .cookie("accessToken", accessToken)
        .json(
            new ApiResponse(200, loggedInUser, "User logged in successfully")
        );
})

export { registerUser, loginUser };
