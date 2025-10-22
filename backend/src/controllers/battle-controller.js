import { levelGroei, updatePokedex } from "../helpers/battle-utils.js";

import { query } from "../config/database.js";

export const getBattleInfo = async (aanval_log_id) => {
  const [aanval_log] = await query("SELECT * FROM `aanval_log` WHERE `id`=?", [
    aanval_log_id,
  ]);
  if (!aanval_log) {
    return undefined;
  }
  let [computer_info] = await query(
    "SELECT pokemon_wild.*, pokemon_wild_gevecht.* FROM pokemon_wild INNER JOIN pokemon_wild_gevecht ON pokemon_wild_gevecht.wildid = pokemon_wild.wild_id WHERE pokemon_wild_gevecht.id= ?",
    [aanval_log.tegenstanderid]
  );

  const enemyPokemons = await query(
    "SELECT id FROM `pokemon_wild_gevecht` WHERE `aanval_log_id`= ?",
    [aanval_log_id]
  );

  computer_info["naam_klein"] = computer_info.naam.toLowerCase();
  computer_info["naam_goed"] = computerNaam(computer_info.naam);

  if (computer_info.shiny === 1) {
    computer_info["map"] = "shiny";
    computer_info["star"] = "block";
  } else {
    computer_info["map"] = "pokemon";
    computer_info["star"] = "none";
  }

  let [pokemon_info] = await query(
    "SELECT pw.*, ps.*, psg.* FROM pokemon_wild AS pw INNER JOIN pokemon_speler AS ps ON ps.wild_id = pw.wild_id INNER JOIN pokemon_speler_gevecht AS psg ON ps.id = psg.id  WHERE psg.id= ?",
    [aanval_log.pokemonid]
  );
  pokemon_info["naam_klein"] = pokemon_info.naam.toLowerCase();
  pokemon_info["naam_goed"] = pokemonNaam(
    pokemon_info.naam,
    pokemon_info.roepnaam
  );

  if (pokemon_info.shiny === 1) {
    pokemon_info["map"] = "shiny";
    pokemon_info["star"] = "block";
  } else {
    pokemon_info["map"] = "pokemon";
    pokemon_info["star"] = "none";
  }

  return {
    computer_info,
    pokemon_info,
    aanval_log,
    enemyPokemons
  };
};

export const acceptEvolution = async (req, res) => {
  const { pokemonId, evoId, decision } = req.body;
  const userId = req.user?.user_id;
  if (decision) {
    const [pokemonInfo] = await query(
      "SELECT pokemon_wild.wild_id, pokemon_wild.naam, pokemon_wild.groei, pokemon_speler.* FROM pokemon_wild INNER JOIN pokemon_speler ON pokemon_wild.wild_id = pokemon_speler.wild_id WHERE pokemon_speler.id=?",
      [pokemonId]
    );
    const [newPokemon] = await query(
      "SELECT * FROM `pokemon_wild` WHERE `wild_id`=?",
      [evoId]
    );

    updatePokedex(evoId, "evo", userId);

    const [newPokemonInfo] = await query(
      "SELECT experience.punten, karakters.* FROM experience INNER JOIN karakters WHERE experience.soort=? AND experience.level=? AND karakters.karakter_naam=?",
      [pokemonInfo.groei, pokemonInfo.level, pokemonInfo.karakter]
    );
    // חישוב הסטטים
    const attackstat = Math.round(
      ((pokemonInfo.attack_iv +
        2 * newPokemon.attack_base +
        Math.floor(pokemonInfo.attack_ev / 4)) *
        pokemonInfo.level) /
        100 +
        5 +
        pokemonInfo.attack_up * newPokemonInfo.attack_add
    );
    const defencestat = Math.round(
      ((pokemonInfo.defence_iv +
        2 * newPokemon.defence_base +
        Math.floor(pokemonInfo.defence_ev / 4)) *
        pokemonInfo.level) /
        100 +
        5 +
        pokemonInfo.defence_up * newPokemonInfo.defence_add
    );
    const speedstat = Math.round(
      ((pokemonInfo.speed_iv +
        2 * newPokemon.speed_base +
        Math.floor(pokemonInfo.speed_ev / 4)) *
        pokemonInfo.level) /
        100 +
        5 +
        pokemonInfo.speed_up * newPokemonInfo.speed_add
    );
    const spcattackstat = Math.round(
      ((pokemonInfo[`spc.attack_iv`] +
        2 * newPokemon[`spc.attack_base`] +
        Math.floor(pokemonInfo["spc.attack_ev"] / 4)) *
        pokemonInfo.level) /
        100 +
        5 +
        pokemonInfo.spc_up * newPokemonInfo[`spc.attack_add`]
    );
    const spcdefencestat = Math.round(
      ((pokemonInfo[`spc.defence_iv`] +
        2 * newPokemon[`spc.defence_base`] +
        Math.floor(pokemonInfo["spc.defence_ev"] / 4)) *
        pokemonInfo.level) /
        100 +
        5 +
        pokemonInfo.spc_up * newPokemonInfo[`spc.defence_add`]
    );
    const hpstat = Math.round(
      ((pokemonInfo.hp_iv +
        2 * newPokemon.hp_base +
        Math.floor(pokemonInfo.hp_ev / 4)) *
        pokemonInfo.level) /
        100 +
        10 +
        pokemonInfo.level +
        pokemonInfo.hp_up
    );

    const abilities = newPokemon.ability.split(",");
    const randomAbility =
      abilities[Math.floor(Math.random() * abilities.length)];

    await query(
      "UPDATE `pokemon_speler` SET `wild_id`=?, `attack`=?, `defence`=?, `speed`=?, `spc.attack`=?, `spc.defence`=?, `levenmax`=?, `leven`=?, `ability`=?, `decision`=NULL WHERE `id`=?",
      [
        evoId,
        attackstat,
        defencestat,
        speedstat,
        spcattackstat,
        spcdefencestat,
        hpstat,
        hpstat,
        randomAbility,
        pokemonId,
      ]
    );
  } else {
    await query("UPDATE `pokemon_speler` SET `decision`=NULL WHERE `id`=?", [
      pokemonId,
    ]);
  }
  const [pokemonNewInfo] = await query(
    "SELECT pokemon_wild.wild_id, pokemon_wild.naam, pokemon_wild.groei, pokemon_speler.* FROM pokemon_wild INNER JOIN pokemon_speler ON pokemon_wild.wild_id = pokemon_speler.wild_id WHERE pokemon_speler.id=?",
    [pokemonId]
  );
  await levelGroei(pokemonNewInfo.level, pokemonNewInfo, userId);

  return res.json({
    success: true,
  });
};

export const learnNewAttack = async (req, res) => {
  const { pokemonId, oldAttack, newAttack } = req.body;
  const userId = req.user?.user_id;

  const [pokemon] = await query(
    "SELECT * FROM `pokemon_speler` WHERE `user_id`=? AND `id`=?",
    [userId, pokemonId]
  );
  if (!pokemon) {
    return res.json({
      success: false,
    });
  }
  await query("UPDATE `pokemon_speler` SET `decision`=NULL WHERE `id`=?", [
    pokemonId,
  ]);

  if (oldAttack) {
    await query(`UPDATE \`pokemon_speler\` SET ${oldAttack}=? WHERE id=?`, [
      newAttack,
      pokemonId,
    ]);
  }

  return res.json({
    success: true,
  });
};

export const getDataGrow = async (req, res) => {
  const userId = req.user?.user_id;
  const myPokemons = await query(
    `SELECT pokemon_wild.naam, pokemon_speler.*  FROM pokemon_wild
  INNER JOIN pokemon_speler ON pokemon_wild.wild_id = pokemon_speler.wild_id
  WHERE user_id = ? AND (pokemon_speler.decision = 'waiting_attack' OR pokemon_speler.decision = 'waiting_evo')`,
    [userId]
  );

  for (const pokemon of myPokemons) {
    const { needsAttention, evolutionOptions, newAttack, pokemonId } =
      await levelGroei(pokemon.level, pokemon, userId);
    return res.json({ needsAttention, evolutionOptions, newAttack, pokemonId });
  }
};

export function computerNaam(old) {
  // אם יש רווח בשם
  if (old.includes(" ")) {
    const pokemon = old.split(" ");
    if (pokemon[1] === "f") return pokemon[0] + " &#9792;"; // ♀
    else if (pokemon[1] === "m") return pokemon[0] + " &#9794;"; // ♂
    else return old;
  } else {
    return old;
  }
}
export function pokemonNaam(old, roepnaam) {
  // אם יש רווח בשם
  if (roepnaam != "") return roepnaam;
  if (old.includes(" ")) {
    const pokemon = old.split(" ");
    if (pokemon[1] === "f") return pokemon[0] + " &#9792;"; // ♀
    else if (pokemon[1] === "m") return pokemon[0] + " &#9794;"; // ♂
    else return old;
  } else {
    return old;
  }
}
