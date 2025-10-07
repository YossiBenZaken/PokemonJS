import { PostChallengeResponse } from "./gyms.api";
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
  wild_id?: number;
  wereld?: string;
  naam?: string;
  zeldzaamheid?: number;
  egg?: number;
  evolutie?: number;
  type1?: string;
  type2?: string;
  gebied?: string;
  vangbaarheid?: string;
  groei?: string;
  base_exp?: number;
  aanval_1?: string;
  aanval_2?: string;
  aanval_3?: string;
  aanval_4?: string;
  attack_base?: number;
  defence_base?: number;
  "spc.attack_base"?: number;
  "spc.defence_base"?: number;
  speed_base?: number;
  hp_base?: number;
  effort_attack?: number;
  effort_defence?: number;
  "effort_spc.attack"?: number;
  "effort_spc.defence"?: number;
  effort_speed?: number;
  effort_hp?: number;
  aparece?: string;
  lendario?: number;
  comerciantes?: string;
  real_id?: number;
  ability?: number;
  id?: number;
  user_id?: number;
  opzak?: string;
  opzak_nummer?: string;
  roepnaam?: string;
  karakter?: string;
  shiny?: number;
  trade?: number;
  gehecht?: number;
  level?: number;
  levenmax?: number;
  leven?: number;
  exp?: number;
  totalexp?: number;
  expnodig?: number;
  attack?: number;
  defence?: number;
  speed?: number;
  "spc.attack"?: number;
  "spc.defence"?: number;
  attack_iv?: number;
  defence_iv?: number;
  speed_iv?: number;
  "spc.attack_iv"?: number;
  "spc.defence_iv"?: number;
  hp_iv?: number;
  attack_ev?: number;
  defence_ev?: number;
  speed_ev?: number;
  "spc.attack_ev"?: number;
  "spc.defence_ev"?: number;
  hp_ev?: number;
  attack_up?: number;
  defence_up?: number;
  speed_up?: number;
  spc_up?: number;
  hp_up?: number;
  effect?: string;
  hoelang?: number;
  ei?: number;
  ei_tijd?: string;
  gevongenmet?: string;
  humor_change?: string;
  naam_changes?: number;
  can_trade?: string;
  release_user?: number;
  release_date?: any;
  top3?: string;
  icon?: any;
  item?: any;
  happy?: number;
  capture_date?: string;
  has_calc?: number;
  poke_reset?: number;
  aanval_log_id?: number;
  duel_id?: number;
  hit_ratio_down?: number;
  poison?: number;
  datainicio?: string;
  copiaid?: number;
  naam_klein?: string;
  naam_goed?: string;
  map?: string;
  star?: string;
}

export interface AanvalLog {
  id?: number;
  user_id?: number;
  gebied?: string;
  trainer?: string;
  laatste_aanval?: string;
  beurten?: number;
  tegenstanderid?: string;
  pokemonid?: string;
  gedaan?: string;
  aanval_bezig_speler?: string;
  aanval_bezig_computer?: string;
  schadeaantegenstander?: number;
  schadeaanspeler?: number;
  gebruikt_id?: string;
  effect_speler?: string;
  effect_computer?: string;
  laatste_aanval_speler?: string;
  laatste_aanval_computer?: string;
  datainicio?: string;
  weather_turns?: number;
  weather?: any;
  zmove?: number;
}

export interface BattleResponse {
  attackType?: string;
  battleFinished: boolean;
  computerEffect?: string;
  computerId?: string;
  damage: string;
  expGained?: number;
  hp: number;
  knockedOut: boolean;
  levelGained?: number;
  maxHp: number;
  message: string;
  nextTurn: boolean;
  playerHp?: number;
  playerMaxHp?: number;
  pokemonEffect?: string;
  pokemonPosition?: string;
  recLeft: number;
  recoilDamage: number;
  steps: string;
  transform?: string;
  weather?: string;
  who: "pokemon" | "computer";
  whoPlayer: "pokemon" | "computer";
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

export interface WildFinishResponse {
  text: boolean;
  money: number;
  drop: boolean;
}

export interface AttackChangePokemonResponse {
  success: boolean;
  data: {
    message: string;
    good: boolean;
    refresh: boolean;
    changePokemon: any;
    opzak_nummer: number;
    attack1: any;
    attack2: any;
    attack3: any;
    attack4: any;
    zmove: any;
    tz: any;
  };
}

export interface TrainerAttackRunResponse {
  message: string;
  good: boolean;
}

export interface AttackUsePotionResponse {
  message: string;
  good: boolean;
  info_potion_left: number;
  option_id: number;
  item_info_naam: string;
  name: string;
  new_life: number;
  pokemonInfo: any;
  pokemon_infight: boolean;
}

export interface AttackUsePokeballResponse {
  message:   string;
  ballLeft:  number;
  good:      boolean;
  option_id: number;
  name:      string;
  type:      string;
  drop:      boolean;
}


export const startWildBattleApi = async (
  pokemonId: number | undefined,
  level: number | undefined,
  area: string,
  rarity: number | undefined = undefined
): Promise<{ aanvalLogId: number }> => {
  const { data } = await axiosInstance.post<{ aanvalLogId: number }>(
    "/battle/start-wild-battle",
    { computer_id: pokemonId, computer_level: level, gebied: area, rarity }
  );
  return data;
};

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

export const wildAttack = async (
  attack_name: string | undefined,
  wie: string,
  aanval_log_id: number,
  zmove: boolean = false
): Promise<BattleResponse> => {
  const { data } = await axiosInstance.post<BattleResponse>(
    "/battle/wild-attack",
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
  const { data } = await axiosInstance.post<TrainerChangePokemonResponse>(
    "/battle/trainer-change-pokemon",
    {
      pokemon_info_name,
      computer_info_name,
      aanval_log_id,
      userId,
    }
  );
  return data;
};

export const trainerFinish = async (
  aanval_log_id: number
): Promise<TrainerFinishResponse> => {
  const { data } = await axiosInstance.post<any>("/battle/trainer-finish", {
    aanval_log_id,
  });
  return data.data;
};

export const wildFinish = async (
  aanval_log_id: number
): Promise<WildFinishResponse> => {
  const { data } = await axiosInstance.post<any>("/battle/wild-finish", {
    aanval_log_id,
  });
  return data.data;
};

export const attackChangePokemon = async (
  opzak_nummer: number,
  aanval_log_id: number
): Promise<AttackChangePokemonResponse> => {
  const { data } = await axiosInstance.post<AttackChangePokemonResponse>(
    "/battle/attack-change-pokemon",
    {
      opzak_nummer,
      aanval_log_id,
    }
  );
  return data;
};

export const trainerAttackRun = async (
  aanval_log_id: number
): Promise<TrainerAttackRunResponse> => {
  const { data } = await axiosInstance.post<TrainerAttackRunResponse>(
    "/battle/trainer-attack-run",
    {
      aanval_log_id,
    }
  );
  return data;
};

export const attackUsePotion = async (
  item: string,
  computer_info_name: string,
  option_id: number,
  potion_pokemon_id: number,
  aanval_log_id: number
): Promise<AttackUsePotionResponse> => {
  const { data } = await axiosInstance.post<AttackUsePotionResponse>(
    "/battle/attack-use-potion",
    {
      item,
      computer_info_name,
      option_id,
      potion_pokemon_id,
      aanval_log_id,
    }
  );
  return data;
};
export const attackUsePokeball = async (
  aanval_log_id: number,
  item: string,
  option_id: string,
  computerEffect: string,
): Promise<AttackUsePokeballResponse> => {
  const { data } = await axiosInstance.post<AttackUsePokeballResponse>(
    "/battle/attack-use-pokeball",
    {
      aanval_log_id,
      item,
      option_id,
      computerEffect,
    }
  );
  return data;
};

export const startRandomTrainer = async(): Promise<PostChallengeResponse> => {
  const {data} = await axiosInstance.get<PostChallengeResponse>('/battle/startRandomBattle');
  return data;
}