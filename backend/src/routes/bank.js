import {
  getBankInfo,
  getTransactionHistory,
  transferToClan,
  transferToPlayer
} from "../controllers/bank-controller.js";

import express from "express";
import { extractAccId } from "../middleware/auth.js";

const router = express.Router();

// Get bank information for user
router.get("/info/:userId", getBankInfo);

// Transfer money to another player
router.post("/transfer-player", extractAccId, transferToPlayer);

// Transfer money to clan
router.post("/transfer-clan", extractAccId, transferToClan);

// Get transaction history
router.get("/history/:userId", getTransactionHistory);

export default router;