import {Router} from 'express';
import { query } from '../config/database.js';

const router = Router();

router.get('/list', async (req, res) => {
  try {
    const rows = await query(
      "SELECT wild_id AS id, naam AS name FROM pokemon_wild ORDER BY naam ASC"
    );
    return res.json({ success: true, pokemons: rows });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "שגיאה בקבלת רשימת פוקימונים",
      error: error.message,
    });
  }
});

export default router;
