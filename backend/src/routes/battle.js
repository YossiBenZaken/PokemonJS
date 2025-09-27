import { InitBattle } from "../controllers/battle-controller.js";
import { doTrainerAttack } from "../controllers/trainer-controller.js";
import express from 'express';
import {extractAccId} from '../middleware/auth.js'

const router = express.Router();

router.post('/init', InitBattle);
router.post('/trainer-attack', extractAccId, doTrainerAttack)

export default router;