import {
  executeTrade,
  getTraders,
  refreshTraders
} from "../controllers/traders-controller.js";

import express from "express";
import { extractAccId } from "../middleware/auth.js";

const router = express.Router();

// Get all traders and their offers
router.get("/", getTraders);

// Execute a trade with a trader
router.post("/trade", extractAccId, executeTrade);

// Admin function to refresh all traders
router.post("/refresh", extractAccId, refreshTraders);

export default router;