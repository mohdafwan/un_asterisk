import express from 'express';
import { serverHealthCheck } from '../controllers/server.controller.js';

const router = express.Router();

router.route("/status").get(serverHealthCheck);

export default router;