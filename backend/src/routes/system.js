import {
  getAssets,
  getOfficialMessages,
  getOnlineUsers,
  updateTickets,
} from "../controllers/system-controllers.js";
import {
  getCooldown,
  getHandPokemons,
  healPokemons,
} from "../controllers/pokemoncenter-controller.js";

import express from "express";
import { extractAccId } from '../middleware/auth.js';

const router = express.Router();

router.get("/online", extractAccId, getOnlineUsers);
router.get("/assets", getAssets);
router.post("/heal", healPokemons);
router.get("/pc/hand", getHandPokemons);
router.get("/cooldown", getCooldown);
router.post("/tickets", extractAccId, updateTickets);
router.post("/official-messages", getOfficialMessages);
export default router;
