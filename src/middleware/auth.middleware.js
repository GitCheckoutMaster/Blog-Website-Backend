import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";

const verifyJWT = asyncHandler(async (req, _, next) => {
    const accessToken =
		req.cookies?.AccessToken ||
		req.header("Authorization")?.replace("Bearer ", "");

    if (!accessToken) {
        throw new ApiError(401, "Access token not found");
    }

    //* this is ai suggested method, check this later, if it works or not
    // jwt.verify(
	// 	accessToken,
	// 	process.env.REFRESH_TOKEN_SECRET,
	// 	(error, user) => {
    //         if (error) {
    //             throw new ApiError(403, "Access token verification error: " + error.message);
    //         }
    //         req.user = user;
    //     }
	// );

    const decodedToken = jwt.verify(
		accessToken,
		process.env.ACCESS_TOKEN_SECRET
	);

    const user = await User.findById(decodedToken._id).select("-password -refreshToken");
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    req.user = user;

    next();
});

export default verifyJWT;
