import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { uploadFileOnCloudinary } from '../utils/cloudinary.js';

import User from '../models/user.model.js';
import { generateAccessAndRefreshToken } from '../utils/constant.js';
import jwt from "jsonwebtoken";


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

const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    if (!email && !username) {
        throw new ApiError(400, "Username or email is required")
    }

    const user = await User.findOne({
        $or: [
            { username }, { email }
        ]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordMatched = await user.isPasswordCorrect(password);
    if (!isPasswordMatched) {
        throw new ApiError(401, "Invalid user credentials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const cookieOptions = {
        httpOnly: true,
        secure: true,
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User logged In Successfully"
            )
        )
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    try {

        const incommingrefreshToken = req.cookies?.refreshToken || req.body.refreshToken;
        if (!incommingrefreshToken) throw new ApiError(401, "Refresh token is required")

        const decodedToken = jwt.verify(incommingrefreshToken, process.env.JWT_REFRESH_SECRET)
        if (!decodedToken) throw new ApiError(401, "Invalid refresh token")

        const user = await User.findById(decodedToken?._id)
        if (!user) throw new ApiError(404, "User not found")

        if (incommingrefreshToken !== user.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or invalid")
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

        const options = {
            httpOnly: true,
            secure: true,
        }

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(new ApiResponse(200, { accessToken, refreshToken }, "Access token refreshed successfully"))
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
})


const currentCurrentUserPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user?._id);
    if (!user) throw new ApiError(404, "User not found");

    const isPasswordMatched = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordMatched) throw new ApiError(401, "Old password is incorrect");


    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, {}, "Password updated successfully"));
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullname, email } = req.body;
    if (!fullname || !email) throw new ApiError(400, "Fullname and email are required");
    User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullname: fullname,
                email: email
            }
        },
        {
            new: true,
        }
    ).select("-password -refreshToken").then((user) => {
        if (!user) throw new ApiError(404, "User not found");
        return res.status(200).json(new ApiResponse(200, user, "User updated successfully"));
    }).catch((error) => {
        throw new ApiError(500, error.message || "Something went wrong");
    })
})

const updataUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path
    if (!avatarLocalPath) throw new ApiError(400, "Profile File Is Missing")

    const uploadAvatar = await uploadFileOnCloudinary(avatarLocalPath)
    if (!uploadAvatar) throw new ApiError(400, "Error While Upload Profile Image")


    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: uploadAvatar.url,
            }
        },
        {
            new: true,
        }
    ).select('-password -refreshToken').then((user) => {
        if (!user) throw new ApiError(404, "User not found");
        return res.status(200).json(new ApiResponse(200, user, "User updated successfully"));
    }).catch((error) => {
        throw new ApiError(500, error.message || "Something went wrong");
    })
})

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path;
    if (!coverImageLocalPath) throw new ApiError(400, "Cover Image Is Missing")

    const uploadCoverImage = await uploadFileOnCloudinary(coverImageLocalPath)
    if (!uploadCoverImage) throw new ApiError(400, "Error While Upload Cover Image")

    User.findByIdAndUpdate(
        res.user?._id,
        {
            $set: {
                coverImage: uploadCoverImage.url
            }
        }, { new: true }
    ).select("-password -refreshToken")
        .then((user) => {
            if (!user) throw new ApiError(404, "User not found");
            return res.status(200).json(new ApiResponse(200, user, "User updated successfully"));
        })
        .catch((error) => {
            throw new ApiError(500, error.message || "Something went wrong");
        })
})

const getUserChannel = asyncHandler(async (req, res) => {
    const { username } = req.params
    if (!username?.trim()) throw new ApiError(400, "Username is required")

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.trim().toLowerCase()
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers",
            }
        }, {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo",
            }
        }, {
            $addFields: {
                subscriberCount: {
                    $size: "$subscribers"
                },
                subscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {
                            $in: [req.user?._id, "$subscribers.subscriber"]
                        },
                        then: true,
                        else: false
                    }
                }
            }
        }, {
            $project: {
                fullname: 1,
                username: 1,
                subscriberCount: 1,
                subscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1
            }
        }
    ])
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged Out"))
})

export { registerUser, loginUser, logoutUser, refreshAccessToken, currentCurrentUserPassword, updateAccountDetails, updataUserAvatar, updateUserCoverImage, getUserChannel };