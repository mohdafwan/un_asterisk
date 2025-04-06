import mongoose from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt";

const UserData = {
    username: {
        type: String,
        required: true,
        unique: true,
        index: true,
        trim: true,
        lowercase: true,
        minLength: 3,
        maxLength: 20,
    },
    email: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true,
        required: true,
        validate: {
            validator: function (email) {
                return /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email);
            },
            message: "Invalid email address",
        },
    },
    fullname: {
        type: String,
        required: true,
        trim: true,
        minLength: 3,
        maxLength: 50,
        index: true,
    },
    avatar: {
        type: String, //cloudinary url
        default: "https://api.dicebear.com/9.x/thumbs/svg"
    },
    coverImage: {
        type: String, //cloudinary url
    },
    watchHistory: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video",
        }
    ],
    password: {
        type: String,
        required: [true, "Password is required"],
        minLength: [6, "Password must be at least 6 characters"],
    },
    refreshToken: {
        type: String,
    },
}

const userSchema = new mongoose.Schema(UserData, { timeseries: true });

//Save data before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = bcrypt.hash(this.password, salt);
    next();
})

//ComparePassword
userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}
//Generate JWT token
userSchema.methods.generateAccessToken = async function () {
    return jwt.sign(
        {
            id: this._id,
            username: this.username, fullname: this.fullname, email: this.email,
        },
        process.env.JWT_ACCESS_SECRET,
        {
            expiresIn: process.env.JWT_ACCESS_EXPIRATION_,
        }
    )
}

//Generate Refresh token
userSchema.methods.generateRefreshToken = async function () {
    return jwt.sign(
        {
            id: this._id,
        },
        process.env.JWT_REFRESH_SECRET,
        {
            expiresIn: process.env.JWT_REFRESH_EXPIRATION_,
        }
    )
}


const User = mongoose.model("User", userSchema);
export default User;