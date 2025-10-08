import {
  completeQuests,
  dailyBonus,
  getAssets,
  getDailyQuests,
  getOfficialMessages,
  updateTickets,
} from "../controllers/system-controllers.js";
import {
  getCooldown,
  getHandPokemons,
  healPokemons,
} from "../controllers/pokemoncenter-controller.js";

import express from "express";
import { extractAccId } from "../middleware/auth.js";

const router = express.Router();

router.get("/assets", getAssets);
router.post("/heal", healPokemons);
router.get("/pc/hand", getHandPokemons);
router.get("/cooldown", getCooldown);
router.post("/tickets", extractAccId, updateTickets);
router.post("/official-messages", getOfficialMessages);
router.get("/daily-bonus", extractAccId, dailyBonus);
router.get('/daily-quests', extractAccId,getDailyQuests);
router.post('/daily-quests/complete/:questNumber', extractAccId,completeQuests);


export default router;
