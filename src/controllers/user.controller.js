import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { uploadFileOnCloudinary } from '../utils/cloudinary.js';

import User from '../models/user.model.js';

const registerUser = asyncHandler(async (req, res) => {
    const avatar = req.files['avatar'][0]?.path;
    const coverImage = req.files['coverImage'][0]?.path;
    const { fullname, username, email, password } = req.body;

    if ([fullname, username, email, password].some(field => !field)) {
        throw new ApiError(400, 'All fields are required');
    }

    const existingUser = await User.findOne({
        $or: [
            { username: username },
            { email: email },
        ]
    })
    if (existingUser) { throw new ApiError(409, "User with email or username already exists") };
    if (!avatar) { throw new ApiError(400, 'Avatar is required') };


    const avatarLocalPath = req.files?.avatar[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }


    const avatarUrl = await uploadFileOnCloudinary(avatarLocalPath);
    const coverImageUrl = await uploadFileOnCloudinary(coverImageLocalPath);


    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }

    const user = await User.create({
        fullname: fullname,
        avatar: avatarUrl.url,
        coverImage: coverImageUrl?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createUser = await User.findOne(user._id).select(
        "-password -refreshToken"
    )

    if (!createUser) throw new ApiError(500, 'Something went wrong user not found');

    return res.status(201).json(
        new ApiResponse(200, createUser, "User registered Successfully")
    )
})

export { registerUser };