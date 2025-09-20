import { fountainResetBasic, fountainResetPremium, getTeamForFountain } from "../controllers/fountain-controller.js";

import express from "express";
import { extractAccId } from "../middleware/auth.js";

const router = express.Router();

router.use(extractAccId);

router.get("/team", getTeamForFountain);
router.post("/reset/basic", fountainResetBasic);
router.post("/reset/premium", fountainResetPremium);

export default router;


