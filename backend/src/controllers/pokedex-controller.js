import { query } from "../config/database.js";

const splitCsv = (str) =>
  String(str || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((n) => Number(n));

export const getPokedexSummary = async (req, res) => {
  try {
    const { userId } = req.params;
    const [user] = await query(
      `SELECT g.user_id, gi.pokedex, g.pok_seen, g.pok_possession
         FROM gebruikers g
         LEFT JOIN gebruikers_item gi ON gi.user_id = g.user_id
        WHERE g.user_id = ?
        LIMIT 1`,
      [userId]
    );

    const [{ total }] = await query(`SELECT COUNT(*) AS total FROM pokemon_wild`);

    const seenArr = splitCsv(user?.pok_seen);
    const ownArr = splitCsv(user?.pok_possession);

    return res.json({
      success: true,
      data: {
        hasPokedex: Number(user?.pokedex || 0) > 0,
        seen: seenArr.length,
        owned: ownArr.length,
        total
      }
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

export const getRaritiesWithPokemons = async (req, res) => {
  try {
    const rarities = await query(`SELECT * FROM zeldzaamheid`);
    const result = [];
    for (const r of rarities) {
      const pokes = await query(
        `SELECT wild_id, naam, real_id FROM pokemon_wild WHERE zeldzaamheid = ? AND aparece = 'sim' ORDER BY real_id`,
        [r.id]
      );
      result.push({ rarity: r, pokemons: pokes });
    }
    return res.json({ success: true, data: result });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

export const listAllPokemons = async (req, res) => {
  try {
    const rows = await query(
      `SELECT wild_id, naam, real_id FROM pokemon_wild WHERE aparece = 'sim' ORDER BY real_id, wild_id ASC`
    );
    return res.json({ success: true, data: rows });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

export const getPokemonInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const [base] = await query(
      `SELECT pw.wild_id, pw.naam, pw.type1, pw.type2, pw.zeldzaamheid, pw.real_id,
              pw.effort_hp, pw.effort_attack,pw.effort_defence,pw.\`effort_spc.attack\`,pw.\`effort_spc.defence\`,pw.effort_speed,
              pw.attack_base, pw.defence_base, pw.speed_base, pw.hp_base, pw.\`spc.attack_base\`, pw.\`spc.defence_base\`,
              pw.evolutie, pw.egg, pw.ability, pw.vangbaarheid, pw.gebied, pw.wereld,
              pw.aanval_1, pw.aanval_2, pw.aanval_3, pw.aanval_4
         FROM pokemon_wild pw
        WHERE pw.wild_id = ? LIMIT 1`,
      [id]
    );
    if (!base) return res.status(404).json({ success: false, message: 'לא נמצא' });

    // Counts
    const [{ count_in_game = 0 } = {}] = await query(
      `SELECT COUNT(wild_id) AS count_in_game FROM pokemon_speler WHERE wild_id = ?`, [id]
    );
    const [{ count_level_100 = 0 } = {}] = await query(
      `SELECT COUNT(id) AS count_level_100 FROM pokemon_speler WHERE wild_id = ? AND level = 100`, [id]
    );

    // Rarity name
    const [rar] = await query(`SELECT nome FROM zeldzaamheid WHERE id = ? LIMIT 1`, [base.zeldzaamheid]);

    // Abilities names
    const abilityIds = String(base.ability || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    let abilities = [];
    if (abilityIds.length) {
      const placeholders = abilityIds.map(() => '?').join(',');
      abilities = await query(`SELECT name FROM abilities WHERE id IN (${placeholders})`, abilityIds);
    }

    // Level-up data (moves and evolutions)
    const levelData = await query(`SELECT * FROM levelen WHERE wild_id = ? ORDER BY level ASC`, [id]);

    // Reverse evolution (who evolves into this)
    const [evoFrom] = await query(`SELECT * FROM levelen WHERE nieuw_id = ? AND wat = 'evo' LIMIT 1`, [id]);
    let evolveFrom = null;
    if (evoFrom) {
      const [fromPoke] = await query(`SELECT wild_id, naam FROM pokemon_wild WHERE wild_id = ? LIMIT 1`, [evoFrom.wild_id]);
      evolveFrom = { from: fromPoke, method: { level: evoFrom.level, stone: evoFrom.stone, trade: evoFrom.trade, time: evoFrom.time, region: evoFrom.region, item: evoFrom.item } };
    }

    // Top 3 strongest of this species
    const top3 = await query(
      `SELECT ps.id, ps.user_id, g.username,
              (ps.attack + ps.defence + ps.speed + ps.\`spc.attack\` + ps.\`spc.defence\`) AS powerTotal
         FROM pokemon_speler ps
         INNER JOIN gebruikers g ON ps.user_id = g.user_id
        WHERE g.banned = 'N' AND g.admin = '0' AND ps.wild_id = ?
        GROUP BY ps.id
        ORDER BY powerTotal DESC, ps.id ASC
        LIMIT 3`,
      [id]
    );

    // TM/HM list related to this wild
    const tmhm = await query(
      `SELECT t.naam, t.type1, t.omschrijving
         FROM tmhm t
         LEFT JOIN tmhm_relacionados r ON t.naam = r.naam
        WHERE FIND_IN_SET(?, r.relacionados) > 0
        ORDER BY t.naam ASC`,
      [id]
    );

    // Type effectiveness vs this pokemon
    const atkTypes = ['Normal','Fire','Water','Electric','Grass','Ice','Fighting','Poison','Ground','Psychic','Bug','Rock','Ghost','Dragon','Dark','Stell','Fairy','Flying'];
    const typeEffectiveness = {};
    for (const t of atkTypes) {
      const [v1] = await query(`SELECT krachtiger FROM voordeel WHERE aanval = ? AND verdediger = ? LIMIT 1`, [t, String(base.type1 || '').charAt(0).toUpperCase() + String(base.type1 || '').slice(1)]);
      const [v2] = await query(`SELECT krachtiger FROM voordeel WHERE aanval = ? AND verdediger = ? LIMIT 1`, [t, String(base.type2 || '').charAt(0).toUpperCase() + String(base.type2 || '').slice(1)]);
      const a = v1?.krachtiger ?? 1;
      const b = v2?.krachtiger ?? 1;
      const mult = Number((a * b).toFixed(2));
      let cls = 'eff1';
      if (mult === 0) cls = 'eff0';
      else if (mult >= 4) cls = 'eff4';
      else if (mult >= 2) cls = 'eff2';
      else if (mult <= 0.25) cls = 'eff14';
      else if (mult <= 0.5) cls = 'eff12';
      typeEffectiveness[t] = { multiplier: mult, cls };
    }

    // Response aggregate
    return res.json({
      success: true,
      data: {
        ...base,
        rarity_name: rar?.nome || null,
        abilities: abilities.map(a => a.name),
        capture_chance: Math.ceil((base.vangbaarheid || 0) / (255 / 100)),
        count_in_game: Number(count_in_game || 0),
        count_level_100: Number(count_level_100 || 0),
        level_data: levelData,
        evolve_from: evolveFrom,
        top3,
        tmhm,
        type_effectiveness: typeEffectiveness
      }
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};


