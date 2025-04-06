import express from 'express';
import { reqisterUser } from '../controllers/user.controller';

const router = express.Router();

router.route("/register", reqisterUser);

export default router;