import { attackChangePokemon, attackUsePotion, doTrainerAttack, finishTrainerBattle, trainerAttackRun, trainerChangePokemon } from "../controllers/trainer-controller.js";

import { InitBattle } from "../controllers/battle-controller.js";
import express from 'express';
import {extractAccId} from '../middleware/auth.js'

const router = express.Router();

router.post('/init', InitBattle);
router.post('/trainer-attack', extractAccId, doTrainerAttack)
router.post('/trainer-change-pokemon', extractAccId, trainerChangePokemon);
router.post('/trainer-finish', extractAccId, finishTrainerBattle);
router.post('/attack-change-pokemon', extractAccId, attackChangePokemon);
router.post('/trainer-attack-run', extractAccId, trainerAttackRun);
router.post('/attack-use-potion', extractAccId, attackUsePotion);

export default router;