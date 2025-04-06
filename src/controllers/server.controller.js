import { asyncHandler } from "../utils/asyncHandler.js";

const serverHealthCheck = asyncHandler(async (req, res) => {
    res.status(200).json({
        message: "OK",
    });
});


export { serverHealthCheck };

