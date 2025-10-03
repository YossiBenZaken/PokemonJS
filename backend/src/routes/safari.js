import {
  getMapData,
  getUsersOnMap,
  handleMove
} from '../controllers/safari-controller.js';

import express from 'express';
import { extractAccId } from '../middleware/auth.js';

const router = express.Router();

// Get map data and tile information
router.get('/map/:mapId', extractAccId, getMapData);

// Get list of users currently on a specific map
router.get('/users/:mapId', extractAccId, getUsersOnMap);

// Handle player movement and check for encounters
router.post('/move', extractAccId, handleMove);

export default router;