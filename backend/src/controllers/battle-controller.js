import { query } from "../config/database.js";

export const getBattleInfo = async (aanval_log_id) => {
  const [aanval_log] = await query("SELECT * FROM `aanval_log` WHERE `id`=?", [
    aanval_log_id,
  ]);
  let [computer_info] = await query(
    "SELECT pokemon_wild.*, pokemon_wild_gevecht.* FROM pokemon_wild INNER JOIN pokemon_wild_gevecht ON pokemon_wild_gevecht.wildid = pokemon_wild.wild_id WHERE pokemon_wild_gevecht.id= ?",
    [aanval_log.tegenstanderid]
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
  }
};

export const InitBattle = async (req, res) => {
  const { aanval_log_id } = req.body;

  const { computer_info, pokemon_info, aanval_log } = await getBattleInfo(
    aanval_log_id
  );

  res.json({
    computer_info,
    pokemon_info,
    aanval_log,
  });
};

function computerNaam(old) {
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
