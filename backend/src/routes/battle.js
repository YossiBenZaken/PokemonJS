import { InitBattle, currentBattle } from "../controllers/battle-controller.js";
import {
  attackChangePokemon,
  attackUsePotion,
  doTrainerAttack,
  finishTrainerBattle,
  startRandomBattle,
  trainerAttackRun,
  trainerChangePokemon,
} from "../controllers/trainer-controller.js";
import {
  attackUsePokeball,
  doWildAttack,
  finishWildBattle,
  startWildBattle,
} from "../controllers/wild-controller.js";

import express from "express";
import { extractAccId } from "../middleware/auth.js";

const router = express.Router();

router.post("/init", InitBattle);
router.post("/trainer-attack", extractAccId, doTrainerAttack);
router.post("/trainer-change-pokemon", extractAccId, trainerChangePokemon);
router.post("/trainer-finish", extractAccId, finishTrainerBattle);
router.post("/attack-change-pokemon", extractAccId, attackChangePokemon);
router.post("/trainer-attack-run", extractAccId, trainerAttackRun);
router.post("/attack-use-potion", extractAccId, attackUsePotion);
router.post("/attack-use-pokeball", extractAccId, attackUsePokeball);
router.post("/start-wild-battle", extractAccId, startWildBattle);
router.post("/wild-finish", extractAccId, finishWildBattle);
router.post("/wild-attack", extractAccId, doWildAttack);
router.get("/startRandomBattle", extractAccId, startRandomBattle);
router.get("/current-battle", extractAccId, currentBattle);
export default router;
