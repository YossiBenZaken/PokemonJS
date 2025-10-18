import fetch from "node-fetch";
import { query } from "../config/database.js";

// השהייה קלה בין בקשות כדי לא להיחסם
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const API = "https://pokeapi.co/api/v2";

export const importGalarPokemons = async (req, res) => {
  try {
    const generation = await fetch(`${API}/generation/8/`).then(r => r.json());
    const speciesList = generation.pokemon_species;

    let insertedCount = 0;

    for (const species of speciesList) {
      const name = species.name;
      console.log(`🔍 Fetching ${name}...`);

      // בדיקה אם קיים כבר במסד הנתונים
      const [exists] = await query("SELECT wild_id FROM pokemon_wild WHERE naam = ?", [name]);
      if (exists) {
        console.log(`⏭️ ${name} already exists, skipping...`);
        continue;
      }

      let data = await fetch(`${API}/pokemon/${name}`).then(r => r.json());
      const real_id = data.id;
      data.id = `${data.id}001`;
      const speciesData = await fetch(species.url).then(r => r.json());

      const types = data.types.map(t => t.type.name);
      const stats = Object.fromEntries(data.stats.map(s => [s.stat.name, s.base_stat]));

      // level-up moves
      const levelMoves = data.moves
        .filter(m => m.version_group_details.some(d => d.move_learn_method.name === "level-up"))
        .map(m => {
          const detail = m.version_group_details.find(d => d.move_learn_method.name === "level-up");
          return {
            level: detail?.level_learned_at ?? 0,
            attack: formatMoveName(m.move.name),
          };
        })
        .filter(m => m.level > 0);

      // TM/HM moves
      const tmMoves = data.moves
        .filter(m => m.version_group_details.some(d => d.move_learn_method.name === "machine"))
        .map(m => formatMoveName(m.move.name));

      // Move tutor moves
      const tutorMoves = data.moves
        .filter(m => m.version_group_details.some(d => d.move_learn_method.name === "tutor"))
        .map(m => formatMoveName(m.move.name));

      // הכנסת הפוקימון למסד הנתונים
      await query(`
        INSERT INTO pokemon_wild (
          wild_id, wereld, naam, zeldzaamheid, evolutie,
          type1, type2, gebied, vangbaarheid, groei, base_exp,
          aanval_1, aanval_2, aanval_3, aanval_4,
          attack_base, defence_base, \`spc.attack_base\`, \`spc.defence_base\`,
          speed_base, hp_base, effort_attack, effort_defence, \`effort_spc.attack\`,
          \`effort_spc.defence\`, effort_speed, effort_hp, aparece, lendario, comerciantes, real_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)
      `, [
        data.id, "Galar", data.name, 1,
        speciesData.evolves_from_species ? 1 : 0,
        types[0], types[1] || '',
        "", speciesData.capture_rate, speciesData.growth_rate?.name || "unknown", data.base_experience,
        data.moves[0]?.move.name || "", data.moves[1]?.move.name || "",
        data.moves[2]?.move.name || "", data.moves[3]?.move.name || "",
        stats.attack, stats.defense, stats["special-attack"], stats["special-defense"],
        stats.speed, stats.hp,
        0, 0, 0, 0, 0, 0,
        "sim", speciesData.is_legendary || speciesData.is_mythical ? 1 : 0, "sim", real_id
      ]);

      // הכנסת מתקפות לפי רמות
      for (const m of levelMoves) {
        await query(`
          INSERT INTO levelen (level, stone, trade, wild_id, wat, nieuw_id, aanval, gender, region, time, item)
          VALUES (?, '', '0', ?, 'att', '0', ?, '', 'Galar', '', '')
        `, [m.level, data.id, m.attack]);
      }

      // עדכון TM/HM
      for (const tmName of tmMoves) {
        const [tm] = await query("SELECT relacionados FROM tmhm_relacionados WHERE naam = ?", [tmName]);
        if (tm) {
          const updated = tm.relacionados ? `${tm.relacionados},${data.id}` : `${data.id}`;
          await query("UPDATE tmhm_relacionados SET relacionados = ? WHERE naam = ?", [updated, tmName]);
        }
      }

      // עדכון Move Tutor
      for (const tutorName of tutorMoves) {
        const [tutor] = await query("SELECT relacionados FROM tmhm_movetutor WHERE naam = ?", [tutorName]);
        if (tutor) {
          const updated = tutor.relacionados ? `${tutor.relacionados},${data.id}` : `${data.id}`;
          await query("UPDATE tmhm_movetutor SET relacionados = ? WHERE naam = ?", [updated, tutorName]);
        }
      }

      insertedCount++;
      console.log(`✅ Added ${data.name} with ${levelMoves.length} moves.`);
      await sleep(500); // חצי שנייה השהייה בין בקשות
    }

    res.json({
      success: true,
      message: `ייבוא הושלם (${insertedCount} פוקימונים נוספו).`,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

const formatMoveName = (name) => {
    return name
      .split("-") // מפריד לפי מקפים
      .map(
        (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ) // אות ראשונה גדולה
      .join(" "); // מחזיר רווח במקום מקף
  };