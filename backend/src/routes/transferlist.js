import { buyPokemon, getFiltersData, getTransferList, removeFromTransferList } from "../controllers/transferlist-controller.js";

import express from "express";
import { extractAccId } from "../middleware/auth.js";

const router = express.Router();

router.get("/", extractAccId, getTransferList);
router.post('/buy', extractAccId, buyPokemon);
router.delete('/:pokemonId', extractAccId, removeFromTransferList);
router.get('/filters', getFiltersData);

export default router;
