import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import asyncHandler from '../utils/asyncHandler.js';
import jwt from "jsonwebtoken";

async function generateAccessAndRefreshTokens(userid) {
    try {
        const user = await User.findById(userid);
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens. Error: " + error.message);
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { email, password, name } = req.body;
	if (!email || !password || !name) {
        throw new ApiError(400, "Missing required fields");
	}
    
	// Check if user with email exists
	const userExists = await User.findOne({ email });
    
	const avatarPath = req.file?.path;
    let avatarUrl = null;
	if (avatarPath) {
        avatarUrl = await uploadOnCloudinary(avatarPath);
	}
	if (userExists) {
        throw new ApiError(400, "User with this email already exists");
	}

    
	const newUser = await User.create({
        name: name,
		password: password,
		email: email,
		avatar: avatarUrl ? avatarUrl.url : "",
	});
    
	if (!newUser) {
        throw new ApiError(500, "Failed to create user");
	}
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(newUser._id);
    const options = {
		httpOnly: true,
	};

	const createdUser = await User.findById(newUser._id).select(
		"-password -refreshToken"
	);
	if (!createdUser) {
		throw new ApiError(500, "Failed to store user");
	}
    console.log("registered successfully");

	return res
		.status(200)
        .cookie("RefreshToken", refreshToken, options)
        .cookie("AccessToken", accessToken, options)
		.json(new ApiResponse(200, createdUser, "User created successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
    if (req.cookies.AccessToken || req.cookies.RefreshToken) {
        throw new ApiError(400, "User already logged in");
    }

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

    const options = {
		httpOnly: true,
	};
    console.log("logged in successfully");
    return res
        .status(200)
        .cookie("RefreshToken", refreshToken, options)
        .cookie("AccessToken", accessToken, options)
        .json(
            new ApiResponse(200, loggedInUser, "User logged in successfully")
        );
});

const generateNewAccessToken = asyncHandler(async (req, res) => {
    const refreshToken = req.body || req.cookies.RefreshToken;
    if (!refreshToken) { 
        throw new ApiError(400, "Refresh token is required");
    }

    const decodedToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    if (!decodedToken) {
        throw new ApiError(401, "Invalid refresh token");
    }
    const user = await User.findById(decodedToken._id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    if (user.refreshToken != refreshToken) {
        throw new ApiError(401, "Refresh token does not match with the user");
    }

    const { newAccessToken, newRefreshToken } = await generateAccessAndRefreshTokens(uset._id);

    return res
        .status(200)
        .cookie("refreshToken", newRefreshToken)
        .cookie("accessToken", newAccessToken)
        .json(
            new ApiResponse(200, {}, "New access token generated successfully")
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    //todo 1: remove refreshToken from user
    await User.findByIdAndUpdate(
		req.user._id,
		{
			$unset: { refreshToken: 1 },
		},
		{ new: true }
	);
    console.log("logged out successfully");

    return res
        .status(200)
        .clearCookie("RefreshToken")
        .clearCookie("AccessToken")
        .json(
            new ApiResponse(200, {}, "Logged out successfully")
        );
});

const getCurrentUser = asyncHandler(async (req, res) => {
    console.log("user fetched successfully!!");
    return res
        .status(200)
        .json(
            new ApiResponse(200, req.user, "User fetched successfully!!")
        );
});

export { registerUser, loginUser, logoutUser, generateNewAccessToken, getCurrentUser };
