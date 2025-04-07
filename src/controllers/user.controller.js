import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { uploadFileOnCloudinary } from '../utils/cloudinary.js';

import User from '../models/user.model.js';

const registerUser = asyncHandler(async (req, res) => {
    try {
        const avatar = req.files['avatar'][0]?.path;
        const coverImage = req.files['coverImage'][0]?.path;
        const { fullname, username, email, password } = req.body;

        if (!fullname || !username || !email || !password) {
            throw new ApiError(400, 'All fields are required');
        }

        const existingUser = await User.findOne({
            $or: [
                { username: username },
                { email: email },
            ]
        })
        if (existingUser) throw new ApiError(400, 'User already exists');
        if (!avatar) throw new ApiError(400, 'Avatar is required');

        const avatarUrl = await uploadFileOnCloudinary(avatar);
        const coverImageUrl = await uploadFileOnCloudinary(coverImage);
        if (!avatarUrl || !coverImageUrl) throw new ApiError(500, 'Failed to upload images');

        const user = await User.create({
            fullname,
            username: username.tolowerCase(),
            email: email.toLowerCase(),
            password,
            avatar: avatarUrl.url,
            coverImage: coverImageUrl?.url || 'https://api.dicebear.com/9.x/thumbs/svg',
        })

        const createUser = await User.findOne(user._id).select(
            "-password -refreshToken"
        )

        if (!createUser) throw new ApiError(500, 'Something went wrong user not found');

        return res.status(201).json(
            new ApiResponse(createUser, 200, 'User created successfully')
        )

    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
        console.error(error);
        return;
    }
})

export { registerUser };