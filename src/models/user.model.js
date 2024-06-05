import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String, 
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    avatar: {
        type: String, // cloudinary image url
    },
    refreshToken: {
        type: String,
    }
}, { timestamps: true });

// encrypt password before saving
userSchema.pre("save", async function(next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 5);
    }
    next();
});

userSchema.methods.isPasswordCorrect = async function (providedPassword) {
    const pass = this.password;
    return await bcrypt.compare(providedPassword, pass);
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
		{
			_id: this._id,
			email: this.email,
		},
		process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
	);
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    )
}

export const User = mongoose.model("User", userSchema);
