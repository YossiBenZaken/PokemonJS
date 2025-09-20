import {
  acceptEgg,
  getDaycareStatus,
  leavePokemon,
  rejectEgg,
  takePokemon
} from "../controllers/daycare-controller.js";

import express from "express";
import { extractAccId } from "../middleware/auth.js";

const router = express.Router();

// Get daycare status for user
router.get("/status/:userId", getDaycareStatus);

// Egg management
router.post("/accept-egg", extractAccId, acceptEgg);
router.post("/reject-egg", extractAccId, rejectEgg);

// Pokemon management
router.post("/leave-pokemon", extractAccId, leavePokemon);
router.post("/take-pokemon", extractAccId, takePokemon);

export default router;