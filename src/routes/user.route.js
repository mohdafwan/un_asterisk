import express from 'express';
import { loginUser, registerUser, logoutUser, refreshAccessToken, currentCurrentUserPassword } from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middlerware.js';
import { isVerifyJWT } from '../middlewares/auth.middleware.js';
const router = express.Router();

router.route("/register").post(upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'coverImage', maxCount: 1 },]), registerUser);
router.route('/logout').post(isVerifyJWT, logoutUser);
router.route('/refresh-token').post(refreshAccessToken);
router.route('/current-password').post(isVerifyJWT, currentCurrentUserPassword);
router.route('/login').post(loginUser);


export default router;