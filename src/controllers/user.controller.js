import { asyncHandler } from '../utils/asyncHandler.js';
import User from '../models/user.model.js';

const reqisterUser = asyncHandler(async (req, res) => {
    res.status(200).json({
        message: "User registered successfully",
        user: req.user,
    })
})

export { reqisterUser };