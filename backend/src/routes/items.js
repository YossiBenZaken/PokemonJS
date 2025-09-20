import { getItemsByCategory, getItemsWithQuantity, getUserItems, sellItem, useItem } from '../controllers/item-controller.js';

import express from 'express';
import { extractAccId } from '../middleware/auth.js';

const router = express.Router();

router.use(extractAccId);

// קבלת נתוני הפריטים של המשתמש
router.get('/user-items', getUserItems);

// קבלת פריטים לפי קטגוריה
router.get('/category/:category', getItemsByCategory);

// קבלת פריטים עם כמות
router.get('/with-quantity/:category', getItemsWithQuantity);

// מכירת פריט
router.post('/sell', sellItem);

// שימוש בפריט
router.post('/use', useItem);

// קבלת פרטי פריט ספציפי
router.get('/details/:itemName', async (req, res) => {
  try {
    const { itemName } = req.params;
    const item = await DB.query('SELECT * FROM markt WHERE naam = ?', [itemName]);
    
    if (item.length === 0) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    
    res.json({ success: true, data: item[0] });
  } catch (error) {
    console.error('Error getting item details:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
