import { pokemonNaam } from "../controllers/battle-controller.js";
import { query } from "../config/database.js";

export function getRandomInt(min, max) {
  // מחזיר מספר שלם בין min ל-max כולל
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function createNewComputerPokemon(newComputerSql, computerLevel) {
  const newComputer = {};

  // Alle gegevens vaststellen
  newComputer.id = newComputerSql.wild_id;
  newComputer.pokemon = newComputerSql.naam;
  newComputer.aanval1 = newComputerSql.aanval_1;
  newComputer.aanval2 = newComputerSql.aanval_2;
  newComputer.aanval3 = newComputerSql.aanval_3;
  newComputer.aanval4 = newComputerSql.aanval_4;

  const abilities = newComputerSql.ability.split(",");
  const randAb = Math.floor(Math.random() * abilities.length);
  newComputer.ability = abilities[randAb];

  let klaar = false;
  let loop = 0;

  do {
    let teller = 0;
    loop++;

    // Load leveling data
    const levelenQuery = await query(
      "SELECT * FROM levelen WHERE wild_id = ? AND level <= ? ORDER BY id ASC",
      [newComputer.id, computerLevel]
    );

    for (const groei of levelenQuery) {
      teller++;

      if (computerLevel >= groei.level) {
        if (groei.wat === "att") {
          // Attack slots
          if (!newComputer.aanval1) newComputer.aanval1 = groei.aanval;
          else if (!newComputer.aanval2) newComputer.aanval2 = groei.aanval;
          else if (!newComputer.aanval3) newComputer.aanval3 = groei.aanval;
          else if (!newComputer.aanval4) newComputer.aanval4 = groei.aanval;
          else {
            // Replace random attack if not already present
            if (
              ![
                newComputer.aanval1,
                newComputer.aanval2,
                newComputer.aanval3,
                newComputer.aanval4,
              ].includes(groei.aanval)
            ) {
              const nummer = Math.floor(Math.random() * 4) + 1;
              if (nummer === 1) newComputer.aanval1 = groei.aanval;
              else if (nummer === 2) newComputer.aanval2 = groei.aanval;
              else if (nummer === 3) newComputer.aanval3 = groei.aanval;
              else if (nummer === 4) newComputer.aanval4 = groei.aanval;
            }
          }
        } else if (groei.wat === "evo") {
          // Evolve Pokémon
          const evoResult = await query(
            "SELECT * FROM pokemon_wild WHERE wild_id = ? LIMIT 1",
            [groei.nieuw_id]
          );
          if (evoResult.length > 0) {
            const evo = evoResult[0];
            newComputer.id = groei.nieuw_id;
            newComputer.pokemon = evo.naam;
            loop = 0; // reset loop
            break; // break while-loop
          }
        }
      } else {
        klaar = true;
        break;
      }
    }

    if (teller === 0 || loop === 2) {
      break;
    }
  } while (!klaar);

  return newComputer;
}

export function createNewComputerStats(
  newComputer,
  newComputerSql,
  computerLevel,
  maxStats
) {
  // IVs אקראיים בין 2 ל-31
  const attackIv = getRandomInt(2, maxStats);
  const defenceIv = getRandomInt(2, maxStats);
  const speedIv = getRandomInt(2, maxStats);
  const spcAttackIv = getRandomInt(2, maxStats);
  const spcDefenceIv = getRandomInt(2, maxStats);
  const hpIv = getRandomInt(2, maxStats);

  // חישוב סטטיסטיקות
  newComputer.attackstat = Math.round(
    (((newComputerSql.attack_base * 2 + attackIv) * computerLevel) / 100 + 5) *
      1
  );
  newComputer.defencestat = Math.round(
    (((newComputerSql.defence_base * 2 + defenceIv) * computerLevel) / 100 +
      5) *
      1
  );
  newComputer.speedstat = Math.round(
    (((newComputerSql.speed_base * 2 + speedIv) * computerLevel) / 100 + 5) * 1
  );
  newComputer.spcattackstat = Math.round(
    (((newComputerSql["spc.attack_base"] * 2 + spcAttackIv) * computerLevel) /
      100 +
      5) *
      1
  );
  newComputer.spcdefencestat = Math.round(
    (((newComputerSql["spc.defence_base"] * 2 + spcDefenceIv) * computerLevel) /
      100 +
      5) *
      1
  );
  newComputer.hpstat = Math.round(
    ((newComputerSql.hp_base * 2 + hpIv) * computerLevel) / 100 +
      computerLevel +
      10
  );

  return newComputer;
}

export async function createPlayer(userId, aanvalLogId) {
  const pokemons = await query(
    "SELECT * FROM pokemon_speler WHERE user_id=? AND opzak='ja' ORDER BY opzak_nummer ASC",
    [userId]
  );
  for (const p of pokemons) {
    await query(
      `INSERT INTO pokemon_speler_gevecht 
          (id, user_id, aanval_log_id, levenmax, leven, attack, defence, speed, \`spc.attack\`, \`spc.defence\`, exp, totalexp, effect, hoelang) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        p.id,
        userId,
        aanvalLogId,
        p.levenmax,
        p.leven,
        p.attack,
        p.defence,
        p.speed,
        p["spc.attack"],
        p["spc.defence"],
        p.exp,
        p.totalexp,
        p.effect,
        p.hoelang,
      ]
    );
  }
}

export async function saveAttack(userId, attackInfo, aanvalLogId) {
  const gebruikt = `,${attackInfo.pokemonid},`;
  await query(
    "UPDATE aanval_log SET laatste_aanval=?, tegenstanderid=?, pokemonid=?, gebruikt_id=? WHERE id=?",
    [
      attackInfo.begin,
      attackInfo.computer_id,
      attackInfo.pokemonid,
      gebruikt,
      aanvalLogId,
    ]
  );
  await query("UPDATE gebruikers SET pagina='trainer-attack' WHERE user_id=?", [
    userId,
  ]);
}

export async function whoCanStart(userId, attackInfo) {
  const opzak = await query(
    "SELECT ps.id, ps.leven, ps.speed, ps.ei, pw.naam FROM pokemon_speler ps INNER JOIN pokemon_wild pw ON ps.wild_id=pw.wild_id WHERE ps.user_id=? AND ps.opzak='ja' ORDER BY ps.opzak_nummer ASC",
    [userId]
  );

  let nummer = 0;
  for (const p of opzak) {
    if (p.leven >= 1 && p.ei == 0) {
      nummer++;
      if (nummer === 1) {
        attackInfo.pokemon_speed = p.speed;
        attackInfo.pokemon = p.naam;
        attackInfo.pokemonid = p.id;
      }
    }
  }

  if (nummer === 0) {
    attackInfo.bericht = "begindood";
  } else {
    attackInfo.begin =
      attackInfo.pokemon_speed >= attackInfo.computer_speed
        ? "spelereersteaanval"
        : "computereersteaanval";
  }

  return attackInfo;
}

export async function updatePokedex(wild_id, wat, userId) {
  const [myData] = await query(
    "SELECT `pok_gezien`,`pok_bezit` FROM `gebruikers` WHERE `user_id`=? LIMIT 1",
    [userId]
  );
  const pokedex_bezit = myData["pok_bezit"].split(",");
  const pokedex_gezien = myData["pok_gezien"].split(",");
  if (["ei", "buy", "evo"].includes(wat)) {
    if (!pokedex_gezien.includes(wild_id)) pokedex_gezien.push(wild_id);
    if (!pokedex_bezit.includes(wild_id)) pokedex_bezit.push(wild_id);
  } else if (wat === "zien") {
    if (!pokedex_gezien.includes(wild_id)) pokedex_gezien.push(wild_id);
  } else if (wat === "vangen") {
    if (!pokedex_bezit.includes(wild_id)) pokedex_bezit.push(wild_id);
  }

  const pokedex_bezit_string = pokedex_bezit.join(",");
  const pokedex_gezien_string = pokedex_gezien.join(",");

  await query(
    "UPDATE `gebruikers` SET `pok_gezien` = ? , `pok_bezit` = ? WHERE user_id = ?",
    [pokedex_gezien_string, pokedex_bezit_string, userId]
  );
}

export const cleanupBattle = async (userId) => {
  await query("DELETE FROM aanval_log WHERE user_id=?", [userId]);
  await query("DELETE FROM pokemon_speler_gevecht WHERE user_id=?", [userId]);

  const inHand = await query(
    "SELECT id FROM pokemon_speler WHERE user_id=? AND opzak='ja' ORDER BY opzak_nummer ASC",
    [userId]
  );
  for (const row of inHand) {
    await query("DELETE FROM pokemon_speler_gevecht WHERE id=?", [row.id]);
  }
};

/**
 * מוחק את נתוני הקרב
 */
export async function removeAttack(userId, aanvalLogId) {
  await query("UPDATE gebruikers SET pagina='attack_start' WHERE user_id=?", [
    userId,
  ]);
  await query("DELETE FROM pokemon_wild_gevecht WHERE aanval_log_id=?", [
    aanvalLogId,
  ]);
  await query("DELETE FROM pokemon_speler_gevecht WHERE aanval_log_id=?", [
    aanvalLogId,
  ]);
  await query("DELETE FROM aanval_log WHERE id=?", [aanvalLogId]);
}

/**
 * מעדכן את מצב הפוקימונים אחרי קרב
 */
export async function pokemonPlayerHandUpdate(userId) {
  const rows = await query(
    `SELECT id, leven, exp, totalexp, effect, attack_ev, defence_ev, speed_ev, \`spc.attack_ev\`, \`spc.defence_ev\`, hp_ev
     FROM pokemon_speler_gevecht WHERE user_id=?`,
    [userId]
  );

  for (const p of rows) {
    await query(
      `UPDATE pokemon_speler SET
        leven=?, exp=?, totalexp=?, effect=?,
        attack_ev=attack_ev+?, defence_ev=defence_ev+?, speed_ev=speed_ev+?,
        \`spc.attack_ev\`=\`spc.attack_ev\`+?, \`spc.defence_ev\`=\`spc.defence_ev\`+?, hp_ev=hp_ev+?
       WHERE id=?`,
      [
        p.leven,
        p.exp,
        p.totalexp,
        p.effect,
        p.attack_ev,
        p.defence_ev,
        p.speed_ev,
        p["spc.attack_ev"],
        p["spc.defence_ev"],
        p.hp_ev,
        p.id,
      ]
    );
  }
}

export const pokemon_grow = async (userId) => {
  let count = 0;

  // שאילתה ראשונה - מביא פוקימונים שצריכים לעלות level
  const sql = `
  SELECT pokemon_wild.naam, pokemon_speler.id, pokemon_speler.roepnaam,
         pokemon_speler.level, pokemon_speler.expnodig, pokemon_speler.exp
  FROM pokemon_wild
  INNER JOIN pokemon_speler ON pokemon_wild.wild_id = pokemon_speler.wild_id
  WHERE user_id = ? AND exp >= expnodig AND opzak = 'ja'
`;

  const pokemons = await query(sql, [userId]);
  let dataOfLevelGrow = {};
  for (const select of pokemons) {
    count++;

    const naamGoed = await pokemonNaam(select.naam, select.roepnaam);

    if (select.level < 100 && select.exp >= select.expnodig) {
      let shouldContinue = true;
      let iterations = 0;
      const maxIterations = 10; // הגנה מלולאה אינסופית

      while (shouldContinue && iterations < maxIterations) {
        iterations++;

        // מביא את הנתונים העדכניים
        const realQuery = `
          SELECT pokemon_wild.*, pokemon_speler.*
          FROM pokemon_wild
          INNER JOIN pokemon_speler ON pokemon_speler.wild_id = pokemon_wild.wild_id
          WHERE pokemon_speler.id = ?
        `;

        const realResults = await query(realQuery, [select.id]);
        if (realResults.length === 0) {
          shouldContinue = false;
          continue;
        }

        const real = realResults[0];

        // level info
        const levelNieuw = real.level + 1;
        if (levelNieuw > 100) {
          shouldContinue = false;
          continue;
        }

        // חישוב סטטים חדשים
        const expnodig = await nieuweStats(real, levelNieuw, real.exp);

        // בדיקה אם הפוקימון עולה level
        dataOfLevelGrow = await levelGroei(levelNieuw, real, userId);

        // יצירת log
        const pokemonNaamEscaped = escapeHtml(naamGoed);

        const eventMessage = `<img src="/images/icons/blue.png" class="imglower" /> <b><a href="./pokemon-profile&id=${select.id}">${pokemonNaamEscaped}</a></b> עלה רמה!`;

        // הוספת אירוע למשתמש
        await query(
          "INSERT INTO gebeurtenis (id, datum, ontvanger_id, bericht, gelezen) VALUES (NULL, NOW(), ?, ?, '0')",
          [userId, eventMessage]
        );

        // תנאי יציאה מהלולאה - תיקון הלוגיקה
        const remainingExp = real.exp - real.expnodig;
        if (expnodig >= remainingExp) {
          shouldContinue = false;
        }
      }

      if (iterations >= maxIterations) {
        console.warn(`Max iterations reached for pokemon ${select.id}`);
      }
    }
  }

  return dataOfLevelGrow;
};

async function nieuweStats(pokemon, levelNieuw, nieuweXp) {
  if (!pokemon || !pokemon.id) {
    throw new Error("Invalid pokemon data");
  }

  if (levelNieuw > 100) {
    throw new Error("Level cannot exceed 100");
  }
  try {
    // חיפוש נתונים בטבלת experience ו-karakters
    const expLevel = levelNieuw + 1;
    let info;

    if (expLevel < 101) {
      const infoQuery = `
              SELECT experience.punten, karakters.* 
              FROM experience 
              INNER JOIN karakters 
              WHERE experience.soort = ? 
              AND experience.level = ? 
              AND karakters.karakter_naam = ? 
              LIMIT 1
          `;
      const [infoResults] = await query(infoQuery, [
        pokemon.groei,
        expLevel,
        pokemon.karakter,
      ]);
      info = infoResults;
    } else {
      const karakterQuery = `
              SELECT * FROM karakters 
              WHERE karakter_naam = ? 
              LIMIT 1
          `;
      const [karakterResults] = await query(karakterQuery, [pokemon.karakter]);
      info = karakterResults;
      info.punten = 0;
    }

    // חישוב EXP שנותר לפוקימון
    const expOver = nieuweXp - pokemon.expnodig;

    /*
     * חישוב סטטים חדשים ו-HP
     * מקור: http://www.upokecenter.com/games/rs/guides/id.html
     * נוסחת סטטים: int((int(int(A*2+B+int(C/4))*D/100)+5)*E)
     */

    const attackStat = Math.round(
      (((pokemon.attack_iv +
        2 * pokemon.attack_base +
        Math.floor(pokemon.attack_ev / 4)) *
        levelNieuw) /
        100 +
        5 +
        pokemon.attack_up) *
        info.attack_add
    );

    const defenceStat = Math.round(
      (((pokemon.defence_iv +
        2 * pokemon.defence_base +
        Math.floor(pokemon.defence_ev / 4)) *
        levelNieuw) /
        100 +
        5 +
        pokemon.defence_up) *
        info.defence_add
    );

    const speedStat = Math.round(
      (((pokemon.speed_iv +
        2 * pokemon.speed_base +
        Math.floor(pokemon.speed_ev / 4)) *
        levelNieuw) /
        100 +
        5 +
        pokemon.speed_up) *
        info.speed_add
    );

    const spcAttackStat = Math.round(
      (((pokemon["spc.attack_iv"] +
        2 * pokemon["spc.attack_base"] +
        Math.floor(pokemon["spc.attack_ev"] / 4)) *
        levelNieuw) /
        100 +
        5 +
        pokemon.spc_up) *
        info["spc.attack_add"]
    );

    const spcDefenceStat = Math.round(
      (((pokemon["spc.defence_iv"] +
        2 * pokemon["spc.defence_base"] +
        Math.floor(pokemon["spc.defence_ev"] / 4)) *
        levelNieuw) /
        100 +
        5 +
        pokemon.spc_up) *
        info["spc.defence_add"]
    );

    // חישוב HP - טיפול מיוחד לפוקימון ID 292
    let hpStat;
    if (pokemon.wild_id != 292) {
      hpStat = Math.round(
        ((pokemon.hp_iv + 2 * pokemon.hp_base + Math.floor(pokemon.hp_ev / 4)) *
          levelNieuw) /
          100 +
          10 +
          levelNieuw +
          pokemon.hp_up
      );
    } else {
      hpStat = 1;
    }

    // שמירת הסטטים החדשים
    const updateQuery = `
          UPDATE pokemon_speler 
          SET level = ?, levenmax = ?, leven = ?, exp = ?, expnodig = ?,
              attack = ?, defence = ?, speed = ?, \`spc.attack\` = ?, 
              \`spc.defence\` = ?, effect = '', hoelang = ''
          WHERE id = ? 
          LIMIT 1
      `;

    await query(updateQuery, [
      levelNieuw,
      hpStat,
      hpStat, // leven = levenmax
      expOver,
      info.punten,
      attackStat,
      defenceStat,
      speedStat,
      spcAttackStat,
      spcDefenceStat,
      pokemon.id,
    ]);

    return info.punten;
  } catch (error) {
    console.error("Error in nieuweStats:", error);
    throw error;
  }
}

export async function levelGroei(levelNieuw, pokemon, userId) {
  try {
    const levelenQuery = `SELECT * FROM levelen WHERE wild_id = ?`;
    const levelenResults = await query(levelenQuery, [pokemon.wild_id]);

    const evolutionResults = [];
    let newAttack = null;

    for (const levelen of levelenResults) {
      if (levelen.wat === "att") {
        if (levelen.level === levelNieuw) {
          const knowsAttack = [
            pokemon.aanval_1,
            pokemon.aanval_2,
            pokemon.aanval_3,
            pokemon.aanval_4,
          ].includes(levelen.aanval);

          if (!knowsAttack) {
            const attacks = [
              pokemon.aanval_1,
              pokemon.aanval_2,
              pokemon.aanval_3,
              pokemon.aanval_4,
            ];
            const emptyIndex = attacks.findIndex((attack) => !attack);

            if (emptyIndex !== -1) {
              // יש מקום פנוי - הוסף את המתקפה
              const field = `aanval_${emptyIndex + 1}`;
              await query(
                `UPDATE pokemon_speler SET ${field} = ? WHERE id = ?`,
                [levelen.aanval, pokemon.id]
              );
              return { type: "attack_added", attack: levelen.aanval };
            } else {
              // אין מקום - שמור למשתמש להחליט מאוחר יותר
              newAttack = levelen.aanval;
              await query("UPDATE `pokemon_speler` SET `decision` = 'waiting_attack' WHERE `id`=?", [pokemon.id]);
            }
          }
        }
      } else if (levelen.wat === "evo") {
        if (pokemon.item !== "Everstone") {
          const canEvolve =
            levelen.level <= levelNieuw ||
            (levelen.trade === 1 && pokemon.trade === "1.5");

          if (canEvolve) {
            let newId = levelen.nieuw_id;

            // טיפול במקרים מיוחדים
            if (levelen.wild_id === "236") {
              const atk = pokemon.attack;
              const def = pokemon.defence;
              if (atk > def) newId = 106;
              else if (atk < def) newId = 107;
              else newId = 237;
            } else if (levelen.wild_id === "265") {
              const rand = Math.floor(Math.random() * 2);
              newId = ["266", "268"][rand];
            } else if (levelen.wild_id === "104") {
              // כאן נצטרך דרך אחרת לקבל את ה-region
              const userRegion = await getUserRegion(userId);
              newId = userRegion === "Alola" ? "105001" : "105";
            }

            // בדיקת תנאים נוספים
            let canProceed = true;

            if (levelen.time) {
              const currentTime = await isDay();
              canProceed = levelen.time === currentTime;
            }

            if (levelen.trade === 1 && pokemon.trade === "1.5") {
              canProceed = pokemon.item === levelen.item;
            }

            if (canProceed) {
              evolutionResults.push({
                pokemonId: pokemon.id,
                newPokemonId: newId,
                evolutionData: levelen,
              });
              await query("UPDATE `pokemon_speler` SET `decision` = 'waiting_evo' WHERE `id`=?", [pokemon.id]);
            }
          }
        }
      }
    }

    // החזר את כל התוצאות
    return {
      needsAttention: evolutionResults.length > 0 || newAttack !== null,
      evolutionOptions: evolutionResults,
      newAttack: newAttack,
      pokemonId: pokemon.id,
    };
  } catch (error) {
    console.error("Error in levelGroei:", error);
    throw error;
  }
}

export async function onePokemonExp(
  aanvalLog,
  pokemonInfo,
  computerInfo,
  userId
) {
  try {
    const ids = aanvalLog.gebruikt_id
      .split(",")
      .filter((id) => id.trim() !== "");
    const ret = { bericht: "<br />", exp: null };
    let aantal = ids.length;

    for (const pokemonId of ids) {
      if (!pokemonId) continue;

      // קבלת מידע הפוקימון שהשתתף
      const usedQuery = `
              SELECT 
                  pokemon_wild.naam, 
                  pokemon_speler.item, 
                  pokemon_speler.roepnaam, 
                  pokemon_speler.trade, 
                  pokemon_speler.level, 
                  pokemon_speler.expnodig, 
                  pokemon_speler_gevecht.leven, 
                  pokemon_speler_gevecht.exp 
              FROM pokemon_wild 
              INNER JOIN pokemon_speler ON pokemon_wild.wild_id = pokemon_speler.wild_id 
              INNER JOIN pokemon_speler_gevecht ON pokemon_speler.id = pokemon_speler_gevecht.id 
              WHERE pokemon_speler.id = ?
          `;

      const usedResults = await query(usedQuery, [pokemonId]);
      if (usedResults.length === 0) continue;

      const usedInfo = usedResults[0];
      usedInfo.naam_goed = await pokemonNaam(usedInfo.naam, usedInfo.roepnaam);

      // אם הפוקימון מת - לא מקבל EXP
      if (usedInfo.leven > 0) {
        // אם הפוקימון level 100 - לא מקבל עוד EXP
        if (usedInfo.level < 100) {
          // בדיקה אם המשתמש premium
          const userResults = await query(
            "SELECT premiumaccount FROM gebruikers WHERE user_id = ?",
            [userId]
          );
          const user = userResults[0];

          const expConfigResults = await query(
            "SELECT * FROM configs WHERE config = 'exp'"
          );
          const valorDaExp = expConfigResults[0];

          let extraExp = 1.5;
          extraExp += parseFloat(usedInfo.trade) || 0;

          if (user.premiumaccount > Date.now() / 1000) {
            extraExp += 2;
          }

          // חישוב EXP
          let expGained =
            Math.round(
              (computerInfo.base_exp * computerInfo.level * extraExp) /
                7 /
                aantal
            ) * valorDaExp.valor;

          // טיפול בפריטים מיוחדים
          const effortUpdates = {
            attack_ev: computerInfo.effort_attack || 0,
            defence_ev: computerInfo.effort_defence || 0,
            speed_ev: computerInfo.effort_speed || 0,
            "spc.attack_ev": computerInfo["effort_spc.attack"] || 0,
            "spc.defence_ev": computerInfo["effort_spc.defence"] || 0,
            hp_ev: computerInfo.effort_hp || 0,
          };

          switch (usedInfo.item) {
            case "Lucky Egg":
              expGained = Math.floor(expGained * 1.5);
              break;
            case "Macho Brace":
              effortUpdates.attack_ev *= 2;
              effortUpdates.defence_ev *= 2;
              effortUpdates.speed_ev *= 2;
              effortUpdates["spc.attack_ev"] *= 2;
              effortUpdates["spc.defence_ev"] *= 2;
              effortUpdates.hp_ev *= 2;
              break;
            case "Power Weight":
              if (effortUpdates.hp_ev > 0) effortUpdates.hp_ev += 4;
              break;
            case "Power Bracer":
              if (effortUpdates.attack_ev > 0) effortUpdates.attack_ev += 4;
              break;
            case "Power Belt":
              if (effortUpdates.defence_ev > 0) effortUpdates.defence_ev += 4;
              break;
            case "Power Lens":
              if (effortUpdates["spc.attack_ev"] > 0)
                effortUpdates["spc.attack_ev"] += 4;
              break;
            case "Power Band":
              if (effortUpdates["spc.defence_ev"] > 0)
                effortUpdates["spc.defence_ev"] += 4;
              break;
            case "Power Anklet":
              if (effortUpdates.speed_ev > 0) effortUpdates.speed_ev += 4;
              break;
          }

          // עדכון EXP ו-Effort points
          const updateQuery = `
                      UPDATE pokemon_speler_gevecht 
                      SET exp = exp + ?, 
                          totalexp = totalexp + ?,
                          attack_ev = attack_ev + ?,
                          defence_ev = defence_ev + ?,
                          speed_ev = speed_ev + ?,
                          \`spc.attack_ev\` = \`spc.attack_ev\` + ?,
                          \`spc.defence_ev\` = \`spc.defence_ev\` + ?,
                          hp_ev = hp_ev + ?
                      WHERE id = ?
                  `;

          await query(updateQuery, [
            expGained,
            expGained,
            effortUpdates.attack_ev,
            effortUpdates.defence_ev,
            effortUpdates.speed_ev,
            effortUpdates["spc.attack_ev"],
            effortUpdates["spc.defence_ev"],
            effortUpdates.hp_ev,
            pokemonId,
          ]);

          ret.exp = expGained;

          // הודעת EXP למשתמש
          const isPremium = user.premiumaccount > Date.now() / 1000;
          const isTraded = usedInfo.trade === "1.5";

          if (isPremium && isTraded) {
            ret.bericht += `${usedInfo.naam_goed} אתה מקבל תוספת ופרימיום תוספת ${expGained} Exp<br />`;
          } else if (isPremium) {
            ret.bericht += `${usedInfo.naam_goed} אתה מקבל פרימיום תוספת ${expGained} Exp<br />`;
          } else if (isTraded) {
            ret.bericht += `${usedInfo.naam_goed} אתה מקבל ${expGained} Exp<br />`;
          } else {
            ret.bericht += `${usedInfo.naam_goed} אתה מקבל ${expGained} Exp<br />`;
          }
        }
      } else {
        aantal -= 1;
      }
    }

    // עדכון רשימת פוקימונים שהשתתפו
    await query("UPDATE aanval_log SET gebruikt_id = ? WHERE id = ?", [
      `,${pokemonInfo.id},`,
      aanvalLog.id,
    ]);

    return ret;
  } catch (error) {
    console.error("Error in onePokemonExp:", error);
    throw error;
  }
}

export const getAttackInfo = async (attackName) => {
  const [attack] = await query("SELECT * FROM aanval WHERE naam = ?", [
    attackName,
  ]);

  return attack || null;
};

// Helper functions for battle calculations
export const damageController = (
  attackerInfo,
  opponentInfo,
  attackInfo,
  weather
) => {
  // Implement damage calculation from PHP damage_controller function
  let damage = 0;

  // Base damage calculation
  if (attackInfo.sterkte > 0) {
    const level = attackerInfo.level;
    const attackStat =
      attackInfo.tipo === "Physical"
        ? attackerInfo.attack
        : attackerInfo["spc.attack"];
    const defenseStat =
      attackInfo.tipo === "Physical"
        ? opponentInfo.defence
        : opponentInfo["spc.defence"];

    // Pokemon damage formula
    damage = Math.floor(
      ((((((2 * level) / 5 + 2) * attackStat) / defenseStat) *
        attackInfo.sterkte) /
        50 +
        2) *
        (Math.random() * 0.15 + 0.85) // Random factor 85-100%
    );

    // STAB (Same Type Attack Bonus)
    if (
      attackInfo.soort === attackerInfo.type1 ||
      attackInfo.soort === attackerInfo.type2
    ) {
      damage = Math.floor(damage * 1.5);
    }

    // Type effectiveness
    const effectiveness = getTypeEffectiveness(attackInfo.soort, opponentInfo);
    damage = Math.floor(damage * effectiveness);

    // Weather effects
    if (weather) {
      damage = applyWeatherEffects(damage, attackInfo, weather);
    }
  } else if (attackInfo.hp_schade > 0) {
    damage = attackInfo.hp_schade;
  }

  return Math.max(0, damage);
};

const getTypeEffectiveness = (attackType, defender) => {
  // Simplified type effectiveness chart
  const typeChart = {
    Water: { Fire: 2, Ground: 2, Rock: 2, Grass: 0.5, Dragon: 0.5, Water: 0.5 },
    Fire: {
      Grass: 2,
      Ice: 2,
      Bug: 2,
      Steel: 2,
      Water: 0.5,
      Fire: 0.5,
      Rock: 0.5,
    },
    Electric: { Water: 2, Flying: 2, Electric: 0.5, Grass: 0.5, Ground: 0 },
    Grass: { Water: 2, Ground: 2, Rock: 2, Fire: 0.5, Grass: 0.5, Flying: 0.5 },
    Psychic: { Fighting: 2, Poison: 2, Psychic: 0.5, Steel: 0.5, Dark: 0 },
    Fighting: {
      Normal: 2,
      Ice: 2,
      Rock: 2,
      Dark: 2,
      Steel: 2,
      Flying: 0.5,
      Psychic: 0.5,
      Ghost: 0,
    },
    Normal: { Rock: 0.5, Steel: 0.5, Ghost: 0 },
  };

  let effectiveness = 1;

  if (typeChart[attackType]?.[defender.type1]) {
    effectiveness *= typeChart[attackType][defender.type1];
  }

  if (defender.type2 && typeChart[attackType]?.[defender.type2]) {
    effectiveness *= typeChart[attackType][defender.type2];
  }

  return effectiveness;
};

const applyWeatherEffects = (damage, attackInfo, weather) => {
  switch (weather) {
    case "rain":
    case "heavy_rain":
      if (attackInfo.soort === "Water") return Math.floor(damage * 1.5);
      if (attackInfo.soort === "Fire") return Math.floor(damage * 0.5);
      break;
    case "harsh_sunlight":
    case "extremely_harsh_sunlight":
      if (attackInfo.soort === "Fire") return Math.floor(damage * 1.5);
      if (attackInfo.soort === "Water") return Math.floor(damage * 0.5);
      break;
    case "sandstorm":
      if (
        attackInfo.naam === "Solar Beam" ||
        attackInfo.naam === "Solar Blade"
      ) {
        return Math.floor(damage * 0.5);
      }
      break;
  }
  return damage;
};

export const multipleHits = (attackInfo, damage) => {
  let finalDamage = damage;
  let message = "";

  if (attackInfo.aantalkeer === "2-5") {
    const times =
      Math.random() < 0.75
        ? Math.floor(Math.random() * 2) + 2
        : Math.floor(Math.random() * 2) + 4;
    finalDamage = damage * times;
    message = `<br/>${attackInfo.naam} hit ${times} times!`;
  } else if (attackInfo.aantalkeer === "1-2") {
    const times = Math.random() < 0.75 ? 1 : 2;
    finalDamage = damage * times;
    if (times === 2)
      message = `<br/>${attackInfo.naam} hit twice due to Parental Bond!`;
  } else if (
    attackInfo.aantalkeer !== "1" &&
    !isNaN(parseInt(attackInfo.aantalkeer))
  ) {
    const times = parseInt(attackInfo.aantalkeer);
    finalDamage = damage * times;
    message = `<br/>${attackInfo.naam} hit ${times} times!`;
  }

  return { damage: finalDamage, message };
};

export const getEffectDuration = (effectName) => {
  switch (effectName) {
    case "Sleep":
    case "Freeze":
      return Math.floor(Math.random() * 6) + 1;
    case "Confused":
      return Math.floor(Math.random() * 4) + 1;
    case "Paralyzed":
      return Math.floor(Math.random() * 4) + 1;
    case "Flinch":
      return 1;
    case "Burn":
    case "Poisoned":
      return 0; // Permanent until cured
    default:
      return 0;
  }
};

export async function applyAttackEffect(
  attackInfo,
  opponentInfo,
  attackerInfo,
  aanvalLog,
  playerPokemon,
  computerPokemon,
  attackStatus
) {
  let messageAdd = "";
  let shouldExit = false;
  let jsonResponse = null;

  // בדיקה אם יש effect והסיכוי מתאים
  if (attackInfo.effect_naam && attackInfo.effect_kans !== 0) {
    const effectChance =
      attackInfo.effect_kans === 100 ||
      Math.floor(Math.random() * 101) <= attackInfo.effect_kans;

    if (effectChance) {
      const [effectInfo] = await query("SELECT * FROM effect WHERE actie = ?", [
        attackInfo.effect_naam,
      ]);

      // EFFECTS NEGATIEF_TIJD (אפקטים זמניים)
      if (
        effectInfo.wat === "negatief_tijd" &&
        ![31, 32, 29, 28, 30, 34, 33].includes(effectInfo.id)
      ) {
        let turns = 0;

        // קביעת מספר התורות based on effect type
        switch (effectInfo.id) {
          case 28: // Sleep
          case 32: // Freeze
            turns = Math.floor(Math.random() * 6) + 1;
            break;
          case 33: // Confused
          case 29: // Paralyzed
            turns = Math.floor(Math.random() * 4) + 1;
            break;
          case 34: // Flinch
            turns = 1;
            break;
        }

        // שמירה על היריב
        await query(
          `UPDATE ${attackStatus.opponentTableFight} 
                   SET effect = ?, hoelang = ? 
                   WHERE id = ? AND effect = ''`,
          [effectInfo.actie, turns, opponentInfo.id]
        );

        let message = `${attackerInfo.naam_goed} השתמש ב${attackInfo.naam}, והיה לזה אפקט.`;
        message +=
          req.query.wie === "computer"
            ? "<br />It is your turn now."
            : `<br />${opponentInfo.naam_goed} Chooses an attack.`;

        // עדכון לוג המתקפה
        await query(
          "UPDATE aanval_log SET laatste_aanval = ?, beurten = beurten + 1 WHERE id = ?",
          [attackStatus.lastAttack, aanvalLog.id]
        );

        // החזרת JSON response
        shouldExit = true;
        jsonResponse = {
          message,
          nextTurn: next_turn,
          hp: opponentInfo.leven,
          maxHp: opponentInfo.levenmax,
          who: attackStatus.opponent,
          knockedOut: 0,
          battleFinished: 0,
          damage: 0,
          computerId: opponentInfo.id,
          pokemonPosition: playerPokemon.opzak_nummer,
          expGained: new_exp,
          levelGained: playerPokemon.expnodig,
          recoilDamage: recoil_d,
          recLeft: rec_left,
          playerMaxHp: attackerInfo.levenmax,
          whoPlayer: attackStatus.you,
          steps: stappen,
          playerHp: attackerInfo.leven,
          attackType: attackInfo.soort || "",
          pokemonEffect: playerPokemon.effect || "",
          computerEffect: computerPokemon.effect || "",
          transform: transform,
          weather: aanvalLog.weather || "",
        };
      }
      // EFFECTS NEGATIEF (אפקטים שליליים קבועים)
      else if (effectInfo.wat === "negatief") {
        let sql = "";
        let text = "";

        const effectActions = {
          // Defence down
          Defence_down: () => {
            const newStat = Math.round(
              (opponentInfo.defence / 100) * (100 - effectInfo.kracht)
            );
            sql = `defence = '${newStat}'`;
            text = "ההגנה ירדה.";
          },
          Defence_down_2: () => {
            const newStat = Math.round(
              (opponentInfo.defence / 100) * (100 - effectInfo.kracht)
            );
            sql = `defence = '${newStat}'`;
            text = "ההגנה ירדה.";
          },
          // Speed down
          Speed_down: () => {
            const newStat = Math.round(
              (opponentInfo.speed / 100) * (100 - effectInfo.kracht)
            );
            sql = `speed = '${newStat}'`;
            text = "המהירות ירדה.";
          },
          Speed_down_2: () => {
            const newStat = Math.round(
              (opponentInfo.speed / 100) * (100 - effectInfo.kracht)
            );
            sql = `speed = '${newStat}'`;
            text = "המהירות ירדה.";
          },
          // Special Defence down
          "Spc.defence_down": () => {
            const newStat = Math.round(
              (opponentInfo["spc.defence"] / 100) * (100 - effectInfo.kracht)
            );
            sql = `\`spc.defence\` = '${newStat}'`;
            text = "ההגנה המיוחדת ירדה.";
          },
          "Spc.defence_down_2": () => {
            const newStat = Math.round(
              (opponentInfo["spc.defence"] / 100) * (100 - effectInfo.kracht)
            );
            sql = `\`spc.defence\` = '${newStat}'`;
            text = "ההגנה המיוחדת ירדה.";
          },
          // Attack down
          Attack_down: () => {
            const newStat = Math.round(
              (opponentInfo.attack / 100) * (100 - effectInfo.kracht)
            );
            sql = `attack = '${newStat}'`;
            text = "ההתקפה ירדה.";
          },
          Attack_down_2: () => {
            const newStat = Math.round(
              (opponentInfo.attack / 100) * (100 - effectInfo.kracht)
            );
            sql = `attack = '${newStat}'`;
            text = "ההתקפה ירדה.";
          },
          // Combined effects
          Attack_defence_down: () => {
            let newStat = Math.round(
              (opponentInfo.attack / 100) * (100 - effectInfo.kracht)
            );
            sql = `attack = '${newStat}'`;
            newStat = Math.round(
              (opponentInfo.defence / 100) * (100 - effectInfo.kracht)
            );
            sql += `, defence = '${newStat}'`;
            text = "ההתקפה והמהירות ירדו.";
          },
          "defence_spc.defence_down": () => {
            let newStat = Math.round(
              (opponentInfo.defence / 100) * (100 - effectInfo.kracht)
            );
            sql = `defence = '${newStat}'`;
            newStat = Math.round(
              (opponentInfo["spc.defence"] / 100) * (100 - effectInfo.kracht)
            );
            sql += `, \`spc.defence\` = '${newStat}'`;
            text = "ההגנה ירדה.";
          },
          Hit_ratio_down: () => {
            const newStat = opponentInfo.hit_ratio_down + 1;
            sql = `hit_ratio_down = '${newStat}'`;
            text = "דיוק הפגיעה ירד.";
          },
        };

        if (effectActions[effectInfo.actie]) {
          effectActions[effectInfo.actie]();

          await query(
            `UPDATE \`${attackStatus.opponentTableFight}\` SET ${sql} WHERE id = ?`,
            [opponentInfo.id]
          );

          messageAdd += `<br />${opponentInfo.naam_goed} ${text}`;
        }
      }
      // EFFECTS POSITIEF (אפקטים חיוביים)
      else if (effectInfo.wat === "positief") {
        let sql = "";
        let text = "";

        const positiveEffects = {
          // Defence up
          Defence_up: () => {
            const newStat = Math.round(
              (attackerInfo.defence / 100) * (100 + effectInfo.kracht)
            );
            sql = `defence = '${newStat}'`;
            text = "ההגנה עלתה.";
          },
          Defence_up_2: () => {
            const newStat = Math.round(
              (attackerInfo.defence / 100) * (100 + effectInfo.kracht)
            );
            sql = `defence = '${newStat}'`;
            text = "ההגנה עלתה.";
          },
          // Attack up
          Attack_up: () => {
            const newStat = Math.round(
              (attackerInfo.attack / 100) * (100 + effectInfo.kracht)
            );
            sql = `attack = '${newStat}'`;
            text = "ההתקפה עלתה.";
          },
          Attack_up_2: () => {
            const newStat = Math.round(
              (attackerInfo.attack / 100) * (100 + effectInfo.kracht)
            );
            sql = `attack = '${newStat}'`;
            text = "ההתקפה עלתה.";
          },
          // Speed up
          Speed_up_2: () => {
            const newStat = Math.round(
              (attackerInfo.speed / 100) * (100 + effectInfo.kracht)
            );
            sql = `speed = '${newStat}'`;
            text = "המהירות עלתה.";
          },
          // Special Defence up
          "Spc.defence_up_2": () => {
            const newStat = Math.round(
              (attackerInfo["spc.defence"] / 100) * (100 + effectInfo.kracht)
            );
            sql = `\`spc.defence\` = '${newStat}'`;
            text = "ההגנה המיוחדת עלתה.";
          },
          // All stats up
          All_up: () => {
            let newStat = Math.round(
              (attackerInfo.attack / 100) * (100 + effectInfo.kracht)
            );
            sql = `attack = '${newStat}'`;
            newStat = Math.round(
              (attackerInfo.defence / 100) * (100 + effectInfo.kracht)
            );
            sql += `, defence = '${newStat}'`;
            newStat = Math.round(
              (attackerInfo["spc.defence"] / 100) * (100 + effectInfo.kracht)
            );
            sql += `, \`spc.defence\` = '${newStat}'`;
            newStat = Math.round(
              (attackerInfo["spc.attack"] / 100) * (100 + effectInfo.kracht)
            );
            sql += `, \`spc.attack\` = '${newStat}'`;
            newStat = Math.round(
              (attackerInfo.speed / 100) * (100 + effectInfo.kracht)
            );
            sql += `, speed = '${newStat}'`;
            text = "כל הסטטים עלו.";
          },
          // Attack & Defence up
          Attack_defence_up: () => {
            let newStat = Math.round(
              (attackerInfo.attack / 100) * (100 + effectInfo.kracht)
            );
            sql = `attack = '${newStat}'`;
            newStat = Math.round(
              (attackerInfo.defence / 100) * (100 + effectInfo.kracht)
            );
            sql += `, defence = '${newStat}'`;
            text = "ההתקפה וההגנה עלו.";
          },
          // Defence & Speed up
          Defence_speed_up_2: () => {
            let newStat = Math.round(
              (attackerInfo.defence / 100) * (100 + effectInfo.kracht)
            );
            sql = `defence = '${newStat}'`;
            newStat = Math.round(
              (attackerInfo.speed / 100) * (100 + effectInfo.kracht)
            );
            sql += `, speed = '${newStat}'`;
            text = "ההגנה והמהירות עלו.";
          },
          // Specials up
          spc_up: () => {
            let newStat = Math.round(
              (attackerInfo["spc.attack"] / 100) * (100 + effectInfo.kracht)
            );
            sql = `\`spc.attack\` = '${newStat}'`;
            newStat = Math.round(
              (attackerInfo["spc.defence"] / 100) * (100 + effectInfo.kracht)
            );
            sql += `, \`spc.defence\` = '${newStat}'`;
            text = "הסטטים המיוחדים עלו.";
          },
          // Defences up
          "defence_spc.defence_up": () => {
            let newStat = Math.round(
              (attackerInfo.defence / 100) * (100 + effectInfo.kracht)
            );
            sql = `defence = '${newStat}'`;
            newStat = Math.round(
              (attackerInfo["spc.defence"] / 100) * (100 + effectInfo.kracht)
            );
            sql += `, \`spc.defence\` = '${newStat}'`;
            text = "ההגנה עלתה.";
          },
          // Attack & Speed up
          attack_speed_up: () => {
            let newStat = Math.round(
              (attackerInfo.attack / 100) * (100 + effectInfo.kracht)
            );
            sql = `attack = '${newStat}'`;
            newStat = Math.round(
              (attackerInfo.speed / 100) * (100 + effectInfo.kracht)
            );
            sql += `, speed = '${newStat}'`;
            text = "ההתקפה והמהירות עלו.";
          },
          // Special Attack up
          "Spc.Attack_up_2": () => {
            const newStat = Math.round(
              (attackerInfo["spc.attack"] / 100) * (100 + effectInfo.kracht)
            );
            sql = `\`spc.attack\` = '${newStat}'`;
            text = "ההתקפה המיוחדת עלתה.";
          },
        };

        if (positiveEffects[effectInfo.actie]) {
          positiveEffects[effectInfo.actie]();

          await query(
            `UPDATE \`${attackStatus.tableFight}\` SET ${sql} WHERE id = ?`,
            [attackerInfo.id]
          );

          messageAdd += `<br />${attackerInfo.naam_goed} ${text}`;
        }
      }
      // EFFECTS BEIDE (אפקטים מעורבים)
      else if (effectInfo.wat === "beide") {
        if (effectInfo.actie === "attack_defence_up_speed_down") {
          let sql = "";
          let newStat = Math.round(
            (attackerInfo.attack / 100) * (100 + effectInfo.kracht)
          );
          sql = `attack = '${newStat}'`;
          newStat = Math.round(
            (attackerInfo.defence / 100) * (100 + effectInfo.kracht)
          );
          sql += `, defence = '${newStat}'`;
          newStat = Math.round(
            (attackerInfo.speed / 100) * (100 - effectInfo.kracht)
          );
          sql += `, speed = '${newStat}'`;

          await query(
            `UPDATE \`${attackStatus.tableFight}\` SET ${sql} WHERE id = ?`,
            [attackerInfo.id]
          );

          messageAdd += `<br />${attackerInfo.naam_goed} עכשיו עם התקפה והגנה מוגברים אך עם מהירות מופחתת.`;
        }
      }
    }
  } else if (attackInfo.extra) {
    let recLeft = attackerInfo.leven;

    switch (attackInfo.extra) {
      case "half_attack_recover":
        if (attackerInfo.leven !== attackerInfo.levenmax) {
          recLeft = attackerInfo.leven + Math.round(lifeDecrease / 2);
          if (recLeft >= attackerInfo.levenmax) {
            recLeft = attackerInfo.levenmax;
          }
          await query(
            `UPDATE ${attackStatus.tableFight} SET leven = ? WHERE id = ?`,
            [recLeft, attackerInfo.id]
          );
          messageAdd += `<br />${attackerInfo.naam_goed} מחלים.`;
          attackerInfo.leven = recLeft;
        }
        break;

      case "uphalfhp":
        if (attackerInfo.leven !== attackerInfo.levenmax) {
          recLeft = attackerInfo.leven + Math.round(attackerInfo.levenmax / 2);
          if (recLeft >= attackerInfo.levenmax) {
            recLeft = attackerInfo.levenmax;
          }
          await query(
            `UPDATE ${attackStatus.tableFight} SET leven = ? WHERE id = ?`,
            [recLeft, attackerInfo.id]
          );
          messageAdd += `<br />${attackerInfo.naam_goed} מחלים.`;
          attackerInfo.leven = recLeft;
        }
        break;

      case "up75percenthp":
        if (attackerInfo.leven !== attackerInfo.levenmax) {
          recLeft = attackerInfo.leven + Math.round((lifeDecrease / 100) * 75);
          if (recLeft >= attackerInfo.levenmax) {
            recLeft = attackerInfo.levenmax;
          }
          await query(
            `UPDATE ${attackStatus.tableFight} SET leven = ? WHERE id = ?`,
            [recLeft, attackerInfo.id]
          );
          messageAdd += `<br />${attackerInfo.naam_goed} מחלים.`;
          attackerInfo.leven = recLeft;
        }
        break;

      case "sleep_half_attack_recover":
        if (
          attackerInfo.leven !== attackerInfo.levenmax &&
          opponentInfo.effect === "Sleep"
        ) {
          recLeft = attackerInfo.leven + Math.round(lifeDecrease / 2);
          if (recLeft >= attackerInfo.levenmax) {
            recLeft = attackerInfo.levenmax;
          }
          await query(
            `UPDATE ${attackStatus.tableFight} SET leven = ? WHERE id = ?`,
            [recLeft, attackerInfo.id]
          );
          messageAdd += `<br />${attackerInfo.naam_goed} מחלים.`;
          attackerInfo.leven = recLeft;
        }
        break;
    }
  }

  return { messageAdd, shouldExit, jsonResponse };
}

export const rank = async (rankNumber) => {
  const [rankQuery] = await query(
    "SELECT * FROM `rank` WHERE `ranknummer`=? LIMIT 1",
    [rankNumber]
  );

  return {
    rankNumber,
    rankName: `${rankNumber} - ${rankQuery.naam}`,
  };
};

export const rankerbij = async (type, userId, acc_id) => {
  let [playerRank] = await query(
    "SELECT `g`.`username`,`g`.`user_id`,`g`.`rankexp`,`g`.`rankexpnodig`,`g`.`rank`,`g`.`premiumaccount` FROM `gebruikers` AS `g` INNER JOIN `rekeningen` AS `r` ON `g`.`acc_id`=`r`.`acc_id` WHERE `g`.`user_id`=? LIMIT 1",
    [userId]
  );
  let premiumFlag = 1;
  if (playerRank.premiumaccount > new Date()) premiumFlag += 0.5;

  let typeNumber;
  switch (type) {
    case "race":
      typeNumber = 1;
      break;
    case "werken":
    case "whoisitquiz":
      typeNumber = 2;
      break;
    case "attack":
    case "jail":
      typeNumber = 3;
      break;
    case "trainer":
      typeNumber = 4;
      break;
    case "gym":
    case "duel":
      typeNumber = 5;
      break;
  }

  const _rank = await rank(playerRank.rank);
  const result = Math.round(
    (((_rank.rankNumber / 0.5) * typeNumber) / 3) * premiumFlag
  );
  await query(
    "UPDATE `gebruikers` SET `rankexp`=`rankexp`+ ? WHERE `user_id`=? LIMIT 1",
    [result, userId]
  );

  playerRank.rankexp += result;
  if (playerRank.rankexpnoding <= playerRank.rankexp) {
    const rankExpOver = playerRank.rankexp - playerRank.rankexpnoding;
    const newRank = ++playerRank.rank;

    if (newRank <= 33) {
      const [rankDetails] = await query(
        "SELECT `naam`,`punten` FROM `rank` WHERE `ranknummer`=? LIMIT 1",
        [newRank]
      );

      if (newRank >= 33) {
        await query(
          "UPDATE `gebruikers` SET `rank`='33', `rankexp`='1', `rankexpnodig`='170000000' WHERE `user_id`=?",
          [userId]
        );
      } else {
        await query(
          "UPDATE `gebruikers` SET `rank`=?, `rankexp`=?, `rankexpnodig`=? WHERE `user_id`=?",
          [newRank, rankExpOver, rankDetails.punten, userId]
        );
      }

      const [rankUp] = await query(
        "SELECT * FROM `rank_up` WHERE `rank`=? LIMIT 1",
        [newRank]
      );

      if (rankUp.wild_id != "") {
        const [user] = await query(
          "SELECT COUNT(ps.wild_id) AS in_hand, g.premiumaccount, g.silver FROM gebruikers AS g INNER JOIN pokemon_speler AS ps ON g.user_id = ps.user_id WHERE g.user_id = ? AND ps.opzak='ja'",
          [userId]
        );
        const date = new Date().toISOString().slice(0, 19).replace("T", " ");
        const opzakNumber = user.in_hand + 1;

        const [pokemon] = await query(
          "SELECT `wild_id`,`groei`,`attack_base`,`defence_base`,`speed_base`,`spc.attack_base`,`spc.defence_base`,`hp_base`,`aanval_1`,`aanval_2`,`aanval_3`,`aanval_4`,`ability` FROM `pokemon_wild` WHERE `wild_id`=? LIMIT 1",
          [rankUp.wild_id]
        );
        const abilities = pokemon.ability.split(",");
        const randomAbility =
          abilities[Math.floor(Math.random() * abilities.length)];

        const newPokemon = await query(
          "INSERT INTO `pokemon_speler` (`wild_id`,`aanval_1`,`aanval_2`,`aanval_3`,`aanval_4`) SELECT `wild_id`,`aanval_1`,`aanval_2`,`aanval_3`,`aanval_4` FROM `pokemon_wild` WHERE `wild_id`=?",
          [pokemon.wild_id]
        );
        const pokemonId = newPokemon.insertId;

        const [trait] = await query(
          "SELECT * FROM `karakters` ORDER BY RAND() LIMIT 1"
        );

        const [experience] = await query(
          "SELECT `punten` FROM `experience` WHERE `soort` = ? AND `level` = 6",
          [pokemon.groei]
        );

        // יצירת IVs אקראיים (2-31)
        const attack_iv = Math.floor(Math.random() * 30) + 2;
        const defence_iv = Math.floor(Math.random() * 30) + 2;
        const speed_iv = Math.floor(Math.random() * 30) + 2;
        const spcattack_iv = Math.floor(Math.random() * 30) + 2;
        const spcdefence_iv = Math.floor(Math.random() * 30) + 2;
        const hp_iv = Math.floor(Math.random() * 30) + 2;

        // חישוב הסטטים
        const attackstat = Math.round(
          (((attack_iv + 2 * pokemon.attack_base) * 5) / 100 + 5) *
            trait.attack_add
        );
        const defencestat = Math.round(
          (((defence_iv + 2 * pokemon.defence_base) * 5) / 100 + 5) *
            trait.defence_add
        );
        const speedstat = Math.round(
          (((speed_iv + 2 * pokemon.speed_base) * 5) / 100 + 5) *
            trait.speed_add
        );
        const spcattackstat = Math.round(
          (((spcattack_iv + 2 * pokemon[`spc.attack_base`]) * 5) / 100 + 5) *
            trait[`spc.attack_add`]
        );
        const spcdefencestat = Math.round(
          (((spcdefence_iv + 2 * pokemon[`spc.defence_base`]) * 5) / 100 + 5) *
            trait[`spc.defence_add`]
        );
        const hpstat = Math.round(
          ((hp_iv + 2 * pokemon.hp_base) * 5) / 100 + 10 + 5
        );

        await query(
          "UPDATE `pokemon_speler` SET `level`='5',`karakter`=?,`expnodig`=?,`user_id`=?,`opzak`='nee',`opzak_nummer`=?,`ei`='1',`ei_tijd`=?,`attack_iv`=?,`defence_iv`=?,`speed_iv`=?,`spc.attack_iv`=?,`spc.defence_iv`=?,`hp_iv`=?,`attack`=?,`defence`=?,`speed`=?,`spc.attack`=?,`spc.defence`=?,`levenmax`=?,`leven`=?,`ability`=?,`capture_date`=? WHERE `id`=?",
          [
            trait.karakter_naam,
            experience.punten,
            userId,
            opzakNumber,
            date,
            attack_iv,
            defence_iv,
            speed_iv,
            spcattack_iv,
            spcdefence_iv,
            hp_iv,
            attackstat,
            defencestat,
            speedstat,
            spcattackstat,
            spcdefencestat,
            hpstat,
            hpstat,
            randomAbility,
            date,
            pokemonId,
          ]
        );

        await query(
          "UPDATE `gebruikers` SET `aantalpokemon`=`aantalpokemon`+'1' WHERE `user_id`=?",
          [userId]
        );
      }

      await query(
        "UPDATE `gebruikers` SET `silver`=`silver`+ ?, `points`=`points`+ ? WHERE `user_id`=?",
        [rankUp.silvers, rankUp.extra_points, userId]
      );
      await query(
        "UPDATE `rekeningen` SET `gold`=`gold`+ ?,  WHERE `acc_id`=?",
        [rankUp.golds, acc_id]
      );

      let msg =
        "וכ<b>פרס</b> הוא זכה:<b>" +
        highAmount(rankUp.silvers) +
        '</b><img src="/images/icons/silver.png" title="" width="16" height="16" title="Silver">';
      if (rankUp.golds > 0) {
        msg +=
          " ו <b>" +
          highAmount(rankUp.golds) +
          '</b> <img src="/images/icons/gold.png" title="" width="16" height="16" title="Gold">';
      }

      if (rankUp.wild_id != "") {
        msg += "וביצת פוקימון";
      }

      if (rankUp.message != "") {
        msg += " ו" + rankUp.message;
      }

      msg += "!";

      const event =
        '<img src="/images/icons/blue.png" class="imglower"/> ' +
        `עלית בדירוג, הדירוג החדש שלך הוא: <b>${rankDetails.naam}</b>.` +
        msg;
      await query(
        "INSERT INTO `gebeurtenis` (`datum`,`ontvanger_id`,`bericht`,`gelezen`) VALUES (NOW(),?,?,0)",
        [userId, event]
      );
    }
  }
};

export function highAmount(amount) {
  return Math.round(amount).toLocaleString("he-IL", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function escapeHtml(str) {
  if (typeof str !== "string") return str;
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
