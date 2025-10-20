import express from 'express';
import { extractAccId } from '../middleware/auth.js';
import {
  handleMove
} from '../controllers/safari-controller.js';

const router = express.Router();


// Handle player movement and check for encounters
router.post('/move', extractAccId, handleMove);

export default router;