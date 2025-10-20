import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

// קבלת רשימת כל הבתים
router.get('/', async (req, res) => {
  try {
    const houses = await query('SELECT * FROM huizen ORDER BY kosten ASC');
    res.json({
      success: true,
      data: houses
    });
  } catch (error) {
    console.error('Error fetching houses:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בטעינת רשימת הבתים'
    });
  }
});

// קבלת בית ספציפי
router.get('/:houseId', async (req, res) => {
  try {
    const { houseId } = req.params;
    const house = await query('SELECT * FROM huizen WHERE afkorting = ?', [houseId]);
    
    if (house.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'בית לא נמצא'
      });
    }

    res.json({
      success: true,
      data: house[0]
    });
  } catch (error) {
    console.error('Error fetching house:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בטעינת הבית'
    });
  }
});

// קניית בית
router.post('/buy', async (req, res) => {
  try {
    const { houseId, userId } = req.body;

    // בדיקות validation
    if (!houseId) {
      return res.status(400).json({
        success: false,
        message: 'לא נבחר בית'
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'משתמש לא מזוהה'
      });
    }

    // קבלת פרטי המשתמש הנוכחי
    const user = await query('SELECT * FROM gebruikers WHERE user_id = ?', [userId]);
    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'משתמש לא נמצא'
      });
    }

    const currentUser = user[0];

    // קבלת פרטי הבית
    const house = await query('SELECT * FROM huizen WHERE afkorting = ?', [houseId]);
    if (house.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'בית לא נמצא'
      });
    }

    const houseData = house[0];

    // בדיקות עסקיות
    if (currentUser.house === houseId) {
      return res.status(400).json({
        success: false,
        message: 'אתה כבר הבעלים של הבית הזה'
      });
    }

    if (currentUser.silver < houseData.kosten) {
      return res.status(400).json({
        success: false,
        message: 'אין לך מספיק כסף'
      });
    }

    if (currentUser.house === 'villa') {
      return res.status(400).json({
        success: false,
        message: 'יש לך כבר וילה'
      });
    }

    if (currentUser.house === 'nhuis' && houseId !== 'villa') {
      return res.status(400).json({
        success: false,
        message: 'יש לך כבר בית טוב יותר'
      });
    }

    if (currentUser.house === 'shuis' && houseId === 'doos') {
      return res.status(400).json({
        success: false,
        message: 'יש לך כבר בית טוב יותר'
      });
    }

    // ביצוע הקנייה
    await query(
      'UPDATE gebruikers SET silver = silver - ?, house = ? WHERE user_id = ?',
      [houseData.kosten, houseId, userId]
    );

    // קבלת פרטי המשתמש המעודכנים
    const updatedUser = await query('SELECT * FROM gebruikers WHERE user_id = ?', [userId]);

    res.json({
      success: true,
      message: `הבית ${houseData.afkorting} נקנה בהצלחה!`,
      data: {
        newHouse: houseId,
        remainingSilver: updatedUser[0].silver,
        houseCost: houseData.kosten
      }
    });

  } catch (error) {
    console.error('Error buying house:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בקניית הבית'
    });
  }
});

// קבלת סטטוס הבתים עבור משתמש
router.get('/status/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await query('SELECT house, silver FROM gebruikers WHERE user_id = ?', [userId]);
    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'משתמש לא נמצא'
      });
    }

    const houses = await query('SELECT * FROM huizen ORDER BY kosten ASC');
    
    // יצירת מערך עם סטטוס כל בית
    const houseStatus = houses.map(house => {
      const isOwned = user[0].house === house.afkorting;
      const canAfford = user[0].silver >= house.kosten;
      const isDisabled = isOwned || 
                        (user[0].house === 'villa') ||
                        (user[0].house === 'nhuis' && house.afkorting !== 'villa') ||
                        (user[0].house === 'shuis' && house.afkorting === 'doos');

      return {
        ...house,
        isOwned,
        canAfford,
        isDisabled
      };
    });

    res.json({
      success: true,
      data: {
        currentHouse: user[0].house,
        silver: user[0].silver,
        houses: houseStatus
      }
    });

  } catch (error) {
    console.error('Error fetching house status:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בטעינת סטטוס הבתים'
    });
  }
});

export default router;
