import express from "express";
import { getLeaderboardsSummary } from "../controllers/leaderboards-controller.js";

const router = express.Router();

router.get("/summary", getLeaderboardsSummary);

export default router;


