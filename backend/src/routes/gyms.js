import { getGyms, postChallenge } from "../controllers/gyms-controller.js";

import express from "express";
import { extractAccId } from "../middleware/auth.js";

const router = express.Router();

router.post('/', extractAccId, getGyms);
router.post('/challenge', extractAccId, postChallenge);


export default router;
