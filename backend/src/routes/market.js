import {
  buyItem,
  buyPokemon,
  getAvailableItems,
  getMarketItems,
  getUserInventory
} from '../controllers/market-controller.js';

import express from 'express';
import { extractAccId } from '../middleware/auth.js';

const router = express.Router();

router.use(extractAccId);

// קבלת פריטים לפי קטגוריה
router.get('/items/:category', getMarketItems);

// קבלת מלאי המשתמש
router.get('/inventory', getUserInventory);

// קניית פריט רגיל
router.post('/buy-item', buyItem);

// קניית פוקימון
router.post('/buy-pokemon', buyPokemon);

// קבלת פריטים זמינים
router.get('/available/:category', getAvailableItems);

export default router;
