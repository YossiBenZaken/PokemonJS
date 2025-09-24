import { getPokedexSummary, getPokemonInfo, getRaritiesWithPokemons, listAllPokemons } from "../controllers/pokedex-controller.js";

import express from "express";

const router = express.Router();

router.get('/summary/:userId', getPokedexSummary);
router.get('/rarities', getRaritiesWithPokemons);
router.get('/list', listAllPokemons);
router.get('/pokemon/:id', getPokemonInfo);

export default router;


