import { query } from "../config/database.js";

export const judgePokemon = async (req, res) => {
  try {
    const { userId, pokemonId } = req.body;

    if (!pokemonId) {
      return res.status(400).json({ success: false, message: "בחר פוקימון." });
    }

    // שליפת הפוקימון
    const [pokemon] = await query(
      `SELECT p.*, w.naam, w.zeldzaamheid 
       FROM pokemon_speler p 
       INNER JOIN pokemon_wild w ON p.wild_id = w.wild_id 
       WHERE p.id = ?`,
      [pokemonId]
    );

    if (!pokemon) {
      return res.status(404).json({ success: false, message: "הפוקימון לא נמצא." });
    }

    if (pokemon.user_id !== userId) {
      return res.status(403).json({ success: false, message: "הפוקימון לא שלך." });
    }

    // בדיקה שיש כסף
    const cost = 10000;
    const [user] = await query(`SELECT silver FROM gebruikers WHERE user_id = ?`, [userId]);
    if (!user || user.silver < cost) {
      return res.status(400).json({ success: false, message: "אין לך מספיק כסף (סילבר)." });
    }

    // הורדת כסף
    await query(`UPDATE gebruikers SET silver = silver - ? WHERE user_id = ?`, [cost, userId]);

    // חישוב פוטנציאל
    const sum =
      pokemon.attack_iv +
      pokemon.defence_iv +
      pokemon.speed_iv +
      pokemon["spc.attack_iv"] +
      pokemon["spc.defence_iv"] +
      pokemon.hp_iv;

    let potencial;
    if (sum <= 90) potencial = "פוטנציאל חלש (Decente)";
    else if (sum <= 120) potencial = "מעל הממוצע";
    else if (sum <= 150) potencial = "יחסית חזק";
    else potencial = "מעולה!";

    // מציאת הסטאט הכי חזק
    const stats = {
      התקפה: pokemon.attack_iv,
      הגנה: pokemon.defence_iv,
      מהירות: pokemon.speed_iv,
      "התקפה מיוחדת": pokemon["spc.attack_iv"],
      "הגנה מיוחדת": pokemon["spc.defence_iv"],
      חיים: pokemon.hp_iv,
    };

    const bestStat = Object.entries(stats).reduce((a, b) => (a[1] >= b[1] ? a : b));

    res.json({
      success: true,
      data: {
        pokemon: {
          id: pokemon.id,
          name: pokemon.naam,
        },
        potential: potencial,
        bestStat: { stat: bestStat[0], value: bestStat[1] },
        stats,
      },
    });
  } catch (err) {
    console.error("❌ שגיאה בשיפוט פוקימון:", err.message);
    res.status(500).json({
      success: false,
      message: "שגיאה פנימית בשיפוט פוקימון",
      error: err.message,
    });
  }
};
