import DB from "../config/database.js";

// קבלת הפוקימונים שביד המשתמש (עד 6) לפי סדר
export const getHandPokemons = async (req, res) => {
  try {
    const {userId} = req.query;

    const [rows] = await DB.query(
      `SELECT ps.id, ps.user_id, ps.roepnaam, pw.naam, ps.icon, ps.shiny, ps.wild_id, ps.ei, ps.leven, ps.levenmax, ps.effect, ps.opzak, ps.opzak_nummer
        FROM pokemon_speler as ps
        INNER JOIN pokemon_wild as pw ON ps.wild_id = pw.wild_id
        WHERE ps.user_id = ? and ps.opzak = 'ja'
        ORDER BY opzak_nummer ASC
        LIMIT 6`,
      [userId]
    );

    return res.json({ success: true, pokemons: rows });
  } catch (error) {
    console.error("Error fetching hand pokemons:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ריפוי פוקימונים
export const healPokemons = async (req, res) => {
  try {
    const { pokemonIds, userId } = req.body; // array<number>

    if (!Array.isArray(pokemonIds) || pokemonIds.length === 0) {
      return res.status(400).json({ success: false, message: "לא נבחרו פוקימונים" });
    }

    // ודא שכל הערכים הם מספרים
    if (!pokemonIds.every((v) => Number.isInteger(v))) {
      return res.status(400).json({ success: false, message: "קלט לא תקין" });
    }

    const [[cd]] = await DB.query(
        `SELECT TIMESTAMPDIFF(SECOND, pokecentertijdbegin, NOW()) AS passed, pokecentertijd
         FROM gebruikers WHERE user_id = ? LIMIT 1`,
        [userId]
      );
      const remaining = Math.max(0, (cd?.pokecentertijd ?? 0) - (cd?.passed ?? 0));
      if (remaining > 0) {
        return res.status(429).json({ success: false, message: 'יש להמתין', remaining });
      }

    // בדיקת בעלות ואיסוף נתונים לריפוי
    const [ownedRows] = await DB.query(
      `SELECT id, user_id, leven, levenmax, effect
       FROM pokemon_speler
       WHERE user_id = ? AND id IN (${pokemonIds.map(() => '?').join(',')})`,
      [userId, ...pokemonIds]
    );

    if (!ownedRows || ownedRows.length !== pokemonIds.length) {
      return res.status(403).json({ success: false, message: "נמצאו פוקימונים שאינם שלך" });
    }

    // בדוק שאין ניסיון לרפא פוקימון בריא לחלוטין
    const invalid = ownedRows.find((p) => (!p.effect || p.effect === '') && p.leven >= p.levenmax);
    if (invalid) {
      return res.status(400).json({ success: false, message: "לא ניתן לרפא פוקימון בריא" });
    }

    // קביעת זמן המתנה לפי פרימיום/אדמין
    const [[user]] = await DB.query(
      `SELECT premiumaccount, admin FROM gebruikers WHERE user_id = ? LIMIT 1`,
      [userId]
    );

    let countTime = 0;
    const nowUnix = Math.floor(Date.now() / 1000);
    if (user && user.premiumaccount > nowUnix) {
      countTime = 1; // VIP
    } else {
      countTime = 20 * pokemonIds.length; // 20 שניות לכל פוקימון
    }
    if (user && user.admin > 0) {
      countTime = 1;
    }

    // ריפוי בפועל
    await DB.query(
      `UPDATE pokemon_speler SET leven = levenmax, effect = '' WHERE user_id = ? AND id IN (${pokemonIds
        .map(() => '?')
        .join(',')})`,
      [userId, ...pokemonIds]
    );

    // עדכון זמן מרכז פוקימון
    await DB.query(
      `UPDATE gebruikers SET pokecentertijdbegin = NOW(), pokecentertijd = ? WHERE user_id = ? LIMIT 1`,
      [countTime, userId]
    );

    return res.json({ success: true, healed: pokemonIds.length, count_time: countTime });
  } catch (error) {
    console.error("Error healing pokemons:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getCooldown = async (req, res) => {
    const {userId} = req.query;
    const [[row]] = await DB.query(
      `SELECT TIMESTAMPDIFF(SECOND, pokecentertijdbegin, NOW()) AS passed, pokecentertijd
       FROM gebruikers WHERE user_id = ? LIMIT 1`,
      [userId]
    );
    const remaining = Math.max(0, (row?.pokecentertijd ?? 0) - (row?.passed ?? 0));
    // עדכון זמן מרכז פוקימון
    await DB.query(
      `UPDATE gebruikers SET pokecentertijdbegin = NOW(), pokecentertijd = ? WHERE user_id = ? LIMIT 1`,
      [remaining, userId]
    );
    res.json({ success: true, remaining });
  };
