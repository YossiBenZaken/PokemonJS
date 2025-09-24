import { query, transaction } from "../config/database.js";

const REGIONS = ['kanto', 'johto', 'hoenn', 'sinnoh', 'unova', 'kalos', 'alola'];
const BASE_PRICES = { kanto: 50, johto: 100, hoenn: 200, sinnoh: 300, unova: 500, kalos: 1000, alola: 1500 };
const TIME_ARR = [60, 120, 180, 240, 300, 360, 420];

const computeRegionIndex = (world) => {
  const idx = REGIONS.indexOf(String(world || '').toLowerCase());
  return idx >= 0 ? idx : 0;
};

const formatPrices = (user) => {
  const currentIdx = computeRegionIndex(user.wereld);
  const inHand = user.in_hand || 0;
  const premiumActive = (user.premiumaccount || 0) > Math.floor(Date.now() / 1000);

  const prices = {};
  REGIONS.forEach((r, i) => {
    const total = (BASE_PRICES[r] || 0) * inHand;
    const capped = premiumActive ? Math.min(total, 1000) : total;
    const timeTotal = Math.abs(TIME_ARR[i] - TIME_ARR[currentIdx]);
    prices[r] = {
      perPokemon: BASE_PRICES[r],
      total: capped,
      time: timeTotal
    };
  });
  return prices;
};

export const getTravelInfo = async (req, res) => {
  try {
    const { userId } = req.params;
    const [user] = await query(
      `SELECT g.user_id, g.wereld, COUNT(ps.wild_id) AS in_hand, g.premiumaccount, g.silver
         FROM gebruikers g
         INNER JOIN pokemon_speler AS ps ON g.user_id = ps.user_id
        WHERE g.user_id = ? LIMIT 1`,
      [userId]
    );
    if (!user) return res.status(404).json({ success: false, message: 'משתמש לא נמצא' });

    const prices = formatPrices(user);

    return res.json({
      success: true,
      data: {
        world: user.wereld,
        in_hand: user.in_hand,
        silver: user.silver,
        premiumActive: (user.premiumaccount || 0) > Math.floor(Date.now() / 1000),
        prices,
        regions: REGIONS
      }
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

export const travelGo = async (req, res) => {
  try {
    const { userId, region } = req.body || {};
    if (!userId || !region) return res.status(400).json({ success: false, message: 'נתונים חסרים' });
    const regionKey = String(region).toLowerCase();
    if (!REGIONS.includes(regionKey)) return res.status(400).json({ success: false, message: 'אזור לא חוקי' });

    const [user] = await query(
      `SELECT g.user_id, g.wereld, COUNT(ps.wild_id) AS in_hand, g.premiumaccount, g.silver,
              g.Kanto_block, g.Johto_block, g.Hoenn_block, g.Sinnoh_block, g.Unova_block, g.Kalos_block, g.Alola_block
         FROM gebruikers g
         INNER JOIN pokemon_speler AS ps ON g.user_id = ps.user_id
         WHERE g.user_id = ? LIMIT 1`,
      [userId]
    );
    if (!user) return res.status(404).json({ success: false, message: 'משתמש לא נמצא' });

    const capName = regionKey.charAt(0).toUpperCase() + regionKey.slice(1);
    if (String(user.wereld).toLowerCase() === regionKey) return res.status(400).json({ success: false, message: 'אתה כבר באזור זה' });

    const prices = formatPrices(user);
    const needSilver = prices[regionKey].total;
    const timeToTravel = prices[regionKey].time;
    if ((user.silver || 0) <= needSilver) return res.status(400).json({ success: false, message: 'אין מספיק Silver' });

    await transaction(async (conn) => {
      await conn.execute(
        `UPDATE gebruikers SET silver = silver - ?, wereld = ?, traveltijdbegin = NOW(), traveltijd = ? WHERE user_id = ? LIMIT 1`,
        [needSilver, capName, timeToTravel, userId]
      );
    });

    return res.json({ success: true, message: `יצאת ל-${capName}` });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

const hasMove = (p, move) => [p.aanval_1, p.aanval_2, p.aanval_3, p.aanval_4].includes(move);

const validateSurfFly = async (userId, pokemonId, regionKey, moveName) => {
  const [user] = await query(`SELECT user_id, wereld, ${REGIONS.map(r => `${r.charAt(0).toUpperCase()+r.slice(1)}_block AS ${r}`).join(', ')} FROM gebruikers WHERE user_id = ? LIMIT 1`, [userId]);
  if (!user) throw new Error('משתמש לא נמצא');
  const [pokemon] = await query(`SELECT id, user_id, level, aanval_1, aanval_2, aanval_3, aanval_4 FROM pokemon_speler WHERE id = ? LIMIT 1`, [pokemonId]);
  if (!pokemon) throw new Error('פוקימון לא נמצא');
  if (pokemon.user_id !== userId) throw new Error('הפוקימון אינו שלך');
  if (!REGIONS.includes(regionKey)) throw new Error('אזור לא חוקי');
  if (String(user.wereld).toLowerCase() === regionKey) throw new Error('אתה כבר באזור זה');
  if (!hasMove(pokemon, moveName)) throw new Error(`אין לפוקימון את המהלך ${moveName}`);
  if (pokemon.level < 80) throw new Error('Level 80 נדרש');
  return { capName: regionKey.charAt(0).toUpperCase() + regionKey.slice(1) };
};

export const travelSurf = async (req, res) => {
  try {
    const { userId, region, pokemonId } = req.body || {};
    const regionKey = String(region || '').toLowerCase();
    const { capName } = await validateSurfFly(userId, pokemonId, regionKey, 'Surf');
    await query(`UPDATE gebruikers SET wereld = ? WHERE user_id = ? LIMIT 1`, [capName, userId]);
    return res.json({ success: true, message: `גלשת ל-${capName}` });
  } catch (e) {
    return res.status(400).json({ success: false, message: e.message });
  }
};

export const travelFly = async (req, res) => {
  try {
    const { userId, region, pokemonId } = req.body || {};
    const regionKey = String(region || '').toLowerCase();
    const { capName } = await validateSurfFly(userId, pokemonId, regionKey, 'Fly');
    await query(`UPDATE gebruikers SET wereld = ? WHERE user_id = ? LIMIT 1`, [capName, userId]);
    return res.json({ success: true, message: `עפת ל-${capName}` });
  } catch (e) {
    return res.status(400).json({ success: false, message: e.message });
  }
};


