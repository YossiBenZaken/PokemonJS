import { query } from "../config/database.js";

export const getLeaderboardsSummary = async (req, res) => {
  try {
    const strongest = await query(`
      SELECT 
        ps.id,
        ps.user_id,
        g.username,
        pw.wild_id,
        pw.naam,
        (ps.attack + ps.defence + ps.speed + ps.\`spc.attack\` + ps.\`spc.defence\`) AS powerTotal
      FROM pokemon_speler ps
      INNER JOIN pokemon_wild pw ON ps.wild_id = pw.wild_id
      INNER JOIN gebruikers g ON ps.user_id = g.user_id
      WHERE g.banned = 'N'
      ORDER BY powerTotal DESC
      LIMIT 5
    `);

    const experienced = await query(`
      SELECT 
        ps.id,
        ps.user_id,
        g.username,
        pw.wild_id,
        pw.naam,
        ps.totalexp
      FROM pokemon_speler ps
      INNER JOIN pokemon_wild pw ON ps.wild_id = pw.wild_id
      INNER JOIN gebruikers g ON ps.user_id = g.user_id
      WHERE g.banned = 'N'
      ORDER BY ps.totalexp DESC
      LIMIT 5
    `);

    const millionaires = await query(`
      SELECT user_id, username, \`character\`, silver AS total
      FROM gebruikers
      WHERE banned = 'N'
      ORDER BY total DESC
      LIMIT 5
    `);

    const collectors100 = await query(`
      SELECT g.user_id, g.username, g.\`character\`, COUNT(ps.id) AS total
      FROM gebruikers g
      INNER JOIN pokemon_speler ps ON ps.user_id = g.user_id
      WHERE g.banned = 'N' AND ps.level = 100
      GROUP BY g.user_id, g.username, g.\`character\`
      ORDER BY total DESC
      LIMIT 5
    `);

    const duelists = await query(`
      SELECT user_id, username, \`character\`, (won - lost) AS gevechten
      FROM gebruikers
      WHERE banned = 'N'
      ORDER BY gevechten DESC
      LIMIT 5
    `);

    return res.json({
      success: true,
      data: { strongest, experienced, millionaires, collectors100, duelists }
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};


