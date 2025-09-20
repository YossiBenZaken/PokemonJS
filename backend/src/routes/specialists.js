import {
  changeNatureExact,
  changeNatureRandom,
  changeNatureTargeted,
  changeNickname,
  getSpecialistInfo,
  makeShiny
} from "../controllers/specialists-controller.js";

import express from "express";
import { extractAccId } from "../middleware/auth.js";

const router = express.Router();

// Get specialist information and user's Pokemon
router.get("/info/:userId", getSpecialistInfo);

// Shiny specialist - make Pokemon shiny
router.post("/shiny", extractAccId, makeShiny);

// Nickname specialist - change Pokemon names
router.post("/nickname", extractAccId, changeNickname);

// Nature specialists
router.post("/nature-random", extractAccId, changeNatureRandom);
router.post("/nature-targeted", extractAccId, changeNatureTargeted);
router.post("/nature-exact", extractAccId, changeNatureExact);

export default router;