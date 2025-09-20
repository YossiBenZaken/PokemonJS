import {
  authToken,
  login,
  register
} from '../controllers/auth-controller.js';

import express from 'express';
import { extractAccId } from '../middleware/auth.js';

const router = express.Router();

// נתיבי אימות
router.post('/register', register);           // הרשמה
router.post('/login', login);
router.post('/auth-token',extractAccId, authToken);

export default router;
