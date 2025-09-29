import { axiosInstance } from "./axios";

export interface ComputerInfo {
  wild_id: number;
  wereld: string;
  naam: string;
  zeldzaamheid: number;
  egg: number;
  evolutie: number;
  type1: string;
  type2: string;
  gebied: string;
  vangbaarheid: string;
  groei: string;
  base_exp: number;
  aanval_1: string;
  aanval_2: string;
  aanval_3: string;
  aanval_4: string;
  attack_base: number;
  defence_base: number;
  "spc.attack_base": number;
  "spc.defence_base": number;
  speed_base: number;
  hp_base: number;
  effort_attack: number;
  effort_defence: number;
  "effort_spc.attack": number;
  "effort_spc.defence": number;
  effort_speed: number;
  effort_hp: number;
  aparece: string;
  lendario: number;
  comerciantes: string;
  real_id: number;
  ability: number;
  id: number;
  wildid: number;
  aanval_log_id: number;
  shiny: number;
  level: number;
  levenmax: number;
  leven: number;
  attack: number;
  defence: number;
  speed: number;
  "spc.attack": number;
  "spc.defence": number;
  hit_ratio_down: number;
  effect: string;
  hoelang: number;
  local: string;
  poison: number;
  datainicio: string;
  copiaid: number;
  naam_klein: string;
  naam_goed: string;
  map: string;
  star: string;
}

export interface PokemonInfo {
  wild_id: number;
  wereld: string;
  naam: string;
  zeldzaamheid: number;
  egg: number;
  evolutie: number;
  type1: string;
  type2: string;
  gebied: string;
  vangbaarheid: string;
  groei: string;
  base_exp: number;
  aanval_1: string;
  aanval_2: string;
  aanval_3: string;
  aanval_4: string;
  attack_base: number;
  defence_base: number;
  "spc.attack_base": number;
  "spc.defence_base": number;
  speed_base: number;
  hp_base: number;
  effort_attack: number;
  effort_defence: number;
  "effort_spc.attack": number;
  "effort_spc.defence": number;
  effort_speed: number;
  effort_hp: number;
  aparece: string;
  lendario: number;
  comerciantes: string;
  real_id: number;
  ability: number;
  id: number;
  user_id: number;
  opzak: string;
  opzak_nummer: string;
  roepnaam: string;
  karakter: string;
  shiny: number;
  trade: number;
  gehecht: number;
  level: number;
  levenmax: number;
  leven: number;
  exp: number;
  totalexp: number;
  expnodig: number;
  attack: number;
  defence: number;
  speed: number;
  "spc.attack": number;
  "spc.defence": number;
  attack_iv: number;
  defence_iv: number;
  speed_iv: number;
  "spc.attack_iv": number;
  "spc.defence_iv": number;
  hp_iv: number;
  attack_ev: number;
  defence_ev: number;
  speed_ev: number;
  "spc.attack_ev": number;
  "spc.defence_ev": number;
  hp_ev: number;
  attack_up: number;
  defence_up: number;
  speed_up: number;
  spc_up: number;
  hp_up: number;
  effect: string;
  hoelang: number;
  ei: number;
  ei_tijd: string;
  gevongenmet: string;
  humor_change: string;
  naam_changes: number;
  can_trade: string;
  release_user: number;
  release_date: any;
  top3: string;
  icon: any;
  item: any;
  happy: number;
  capture_date: string;
  has_calc: number;
  poke_reset: number;
  aanval_log_id: number;
  duel_id: number;
  hit_ratio_down: number;
  poison: number;
  datainicio: string;
  copiaid: number;
  naam_klein: string;
  naam_goed: string;
  map: string;
  star: string;
}

export interface AanvalLog {
  id: number;
  user_id: number;
  gebied: string;
  trainer: string;
  laatste_aanval: string;
  beurten: number;
  tegenstanderid: string;
  pokemonid: string;
  gedaan: string;
  aanval_bezig_speler: string;
  aanval_bezig_computer: string;
  schadeaantegenstander: number;
  schadeaanspeler: number;
  gebruikt_id: string;
  effect_speler: string;
  effect_computer: string;
  laatste_aanval_speler: string;
  laatste_aanval_computer: string;
  datainicio: string;
  weather_turns: number;
  weather: any;
  zmove: number;
}

export interface BattleResponse {
  message: string;
  nextTurn: boolean;
  hp: number;
  maxHp: number;
  who: "pokemon" | "computer";
  knockedOut: boolean;
  battleFinished: boolean;
  damage: string;
  computerId?: string;
  pokemonPosition?: string;
  expGained?: string;
  levelGained?: string;
  playerHp?: string;
  attackType?: string;
  pokemonEffect?: string;
  computerEffect?: string;
  transform?: string;
  weather?: string;
}

export interface TrainerChangePokemonResponse {
  message: string;
  trainerName: string;
  hp: number;
  maxHp: number;
  refresh: number;
  trainerId: string;
  wildId: number;
  effect: string;
}

export interface TrainerFinishResponse {
  victory: boolean;
  reward: number;
  hm: string;
  badge?: string;
}

export const initBattle = async (
  aanval_log_id: number
): Promise<{
  computer_info: ComputerInfo;
  pokemon_info: PokemonInfo;
  aanval_log: AanvalLog;
}> => {
  const { data } = await axiosInstance.post<{
    computer_info: ComputerInfo;
    pokemon_info: PokemonInfo;
    aanval_log: AanvalLog;
  }>("/battle/init", {
    aanval_log_id,
  });
  return data;
};

export const trainerAttack = async (
  attack_name: string | undefined,
  wie: string,
  aanval_log_id: number,
  zmove: boolean = false
): Promise<BattleResponse> => {
  const { data } = await axiosInstance.post<BattleResponse>(
    "/battle/trainer-attack",
    {
      attack_name,
      wie,
      aanval_log_id,
      zmove: zmove ? "y" : "",
    }
  );
  return data;
};

export const trainerChangePokemonApi = async (
  pokemon_info_name: string,
  computer_info_name: string,
  aanval_log_id: number,
  userId: number | undefined
): Promise<TrainerChangePokemonResponse> => {
  const { data } = await axiosInstance.post<TrainerChangePokemonResponse>("/battle/trainer-change-pokemon", {
    pokemon_info_name,
    computer_info_name,
    aanval_log_id,
    userId,
  });
  return data;
};

export const trainerFinish = async(aanval_log_id: number): Promise<TrainerFinishResponse> => {
  const {data} = await axiosInstance.post<TrainerFinishResponse>('/battle/trainer-finish', {aanval_log_id});
  return data;
}