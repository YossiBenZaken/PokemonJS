import {
  configureBox,
  getBoxInfo,
  getBoxPokemons,
  getPokemonSellInfo,
  movePokemon,
  releasePokemon,
  sellPokemon
} from "../controllers/pokebox-controller.js";

import express from "express";
import { extractAccId } from "../middleware/auth.js";

const router = express.Router();

// Get box information
router.get("/info/:userId/:boxNumber", getBoxInfo);

// Get Pokemon in specific box
router.get("/pokemons/:userId/:boxNumber", getBoxPokemons);

// Move Pokemon between team and box
router.post("/move", extractAccId, movePokemon);

// Configure box settings
router.post("/configure", extractAccId, configureBox);

// Sell Pokemon from box
router.post("/sell", extractAccId, sellPokemon);

router.post("/sell-info", extractAccId, getPokemonSellInfo);

// Release Pokemon (set free)
router.post("/release", extractAccId, releasePokemon);

export default router;