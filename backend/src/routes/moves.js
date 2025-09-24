import { learnMove, listAvailableMoves } from "../controllers/moves-controller.js";

import express from "express";
import { extractAccId } from "../middleware/auth.js";

const router = express.Router();

// List candidate moves for a pokemon (tutor/reminder)
router.get("/list/:pokemonId", listAvailableMoves);

// Learn or remind a move
router.post("/learn", extractAccId, learnMove);

export default router;


