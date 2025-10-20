import { Character } from "../pages/MyCharacters";
import { UserItem } from "../models/item.model";
import { axiosInstance } from "./axios";

export interface CreateCharacterRequest {
  inlognaam: string;
  world: string;
  character: string;
}

export interface CreateCharacterResponse {
  success: boolean;
  message: string;
  data: {
    user_id: number;
    username: string;
    character: string;
    world: string;
  };
}

export interface GetAvailableCharactersResponse {
  success: boolean;
  data: string[];
}

export interface GetUserCharacterCountResponse {
  success: boolean;
  data: {
    characterCount: number;
    maxCharacters: number;
    needsGold: boolean;
  };
}

export interface GetUserCharactersResponse {
  success: boolean;
  data: Array<Character>;
}

export interface LoginWithCharacterRequest {
  user_id: number;
}

export interface LoginWithCharacterResponse {
  success: boolean;
  message: string;
  data: {
    user_id: number;
    username: string;
    character: string;
    world: string;
    session_token: string;
    sec_key: string;
    chat_key: string;
    is_premium: boolean;
    premium_expires: number;
  };
}

export interface GetCharacterDetailsResponse {
  success: boolean;
  data: {
    id: number;
    user_id: number;
    username: string;
    character: string;
    world: string;
    ultimo_login: string;
    ultimo_login_hour: string;
    date: string;
    registration_date: string;
    rank?: number;
    banned?: string;
    admin?: number;
    premiumaccount?: number;
    antiguidade?: number;
    sec_key?: string;
    chat_key?: string;
  };
}

export interface StarterPokemon {
  wild_id: number;
  naam: string;
  type1: string;
  type2?: string;
  groei: string;
  attack_base: number;
  defence_base: number;
  speed_base: number;
  'spc.attack_base': number;
  'spc.defence_base': number;
  hp_base: number;
  aanval_1: string;
  aanval_2: string;
  aanval_3: string;
  aanval_4: string;
  ability: string;
}

export interface GetAvailableStarterPokemonResponse {
  success: boolean;
  data: StarterPokemon[];
}

export interface ChooseStarterPokemonRequest {
  user_id: number;
  pokemon_id: number;
}

export interface ChooseStarterPokemonResponse {
  success: boolean;
  message: string;
  data: {
    pokemon_id: number;
    pokemon_name: string;
    character_trait: string;
    level: number;
    hp: number;
    attack: number;
    defence: number;
    speed: number;
    spc_attack: number;
    spc_defence: number;
  };
}

export interface MessagesResponse {
  success: boolean;
  data: MessagesData;
}

export interface MessagesData {
  messages: Message[];
}

export interface Message {
  id: number;
  trainer_1: Trainer;
  trainer_2: Trainer;
  title: string;
  trainer_1_hidden: number;
  trainer_2_hidden: number;
  last_message: string;
  conversations: Conversation[];
}

export interface Trainer {
  user_id: number;
  username: string;
  character: string;
}

export interface Conversation {
  sender: number;
  reciever: number;
  message: string;
  date: string;
  seen: number;
}

// יצירת דמות חדשה
export const createCharacter = async (
  data: CreateCharacterRequest
): Promise<CreateCharacterResponse> => {
  try {
    const response = await axiosInstance.post("/characters/create", data);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

// קבלת רשימת הדמויות הזמינות
export const getAvailableCharacters =
  async (): Promise<GetAvailableCharactersResponse> => {
    try {
      const response = await axiosInstance.get("/characters/available");
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

// קבלת מספר הדמויות של המשתמש
export const getUserCharacterCount =
  async (): Promise<GetUserCharacterCountResponse> => {
    try {
      const response = await axiosInstance.get("/characters/count");
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

// קבלת רשימת הדמויות של המשתמש
export const getUserCharacters =
  async (): Promise<GetUserCharactersResponse> => {
    try {
      const response = await axiosInstance.get("/characters/my-characters");
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

// כניסה למשחק עם דמות
export const loginWithCharacter = async (
  data: LoginWithCharacterRequest
): Promise<LoginWithCharacterResponse> => {
  try {
    const response = await axiosInstance.post("/characters/login", data);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

// קבלת פרטי דמות ספציפית
export const getCharacterDetails = async (
  user_id: number
): Promise<GetCharacterDetailsResponse> => {
  try {
    const response = await axiosInstance.get(`/characters/details/${user_id}`);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

// קבלת רשימת הפוקימונים הזמינים לבחירה ראשונה
export const getAvailableStarterPokemon = async (
  user_id: number
): Promise<GetAvailableStarterPokemonResponse> => {
  try {
    const response = await axiosInstance.get(
      `/characters/starter-pokemon/${user_id}`
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

// בחירת פוקימון ראשון
export const chooseStarterPokemon = async (
  data: ChooseStarterPokemonRequest
): Promise<ChooseStarterPokemonResponse> => {
  try {
    const response = await axiosInstance.post(
      "/characters/choose-starter",
      data
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

// קבלת פרטי פרופיל של משתמש
export const getUserProfile = async (
  username: string
): Promise<GetUserProfileResponse> => {
  try {
    const response = await axiosInstance.get(`/characters/profile/${username}`);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const getMyPokemons = async (user_id: number): Promise<any> => {
  try {
    const response = await axiosInstance.post("/characters/my-pokemons", {
      user_id,
    });
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const getMessages = async (
  userId: number
): Promise<MessagesResponse> => {
  const { data } = await axiosInstance.post("/characters/get-messages", {
    userId,
  });
  return data;
};

export const readMessage = async (userId: number, conversa: number) => {
  await axiosInstance.post("/characters/read-message", { userId, conversa });
};

export const replyMessage = async (
  sender: number,
  message: string,
  conversa: number
) => {
  await axiosInstance.post("/characters/reply-message", {
    sender,
    userId: sender,
    message,
    conversa,
  });
};

export const sendMessage = async (
  userId: number,
  subject: string,
  message: string,
  player: string
): Promise<number> => {
  const { data } = await axiosInstance.post("/characters/send-message", {
    userId,
    message,
    subject,
    player,
  });
  return data.data;
};

export const getBadges = async (userId: number): Promise<any> => {
  const { data } = await axiosInstance.post("/characters/badges", {
    userId,
  });
  return data.data;
};

export const fish = async (userId: number): Promise<any> => {
  const { data } = await axiosInstance.post("/characters/fish", {
    userId,
  });
  return data;
};

export const getFishingLeaders = async(): Promise<any> => {
  const { data } = await axiosInstance.get("/characters/get-fishing-leaders");
  return data;
}

export const judgePokemon = async(userId: number,pokemonId: number): Promise<JudgeResult> => {
  const {data} = await axiosInstance.post('/characters/judge', {
    userId,
    pokemonId
  });
  return data.data;

}

export type JudgeResult = {
  pokemon: { id: number; name: string };
  potential: string;
  bestStat: { stat: string; value: number };
  stats: Record<string, number>;
};

// ממשקים לפרופיל
export interface UserProfile {
  user_id: number;
  username: string;
  character: string;
  world: string;
  ultimo_login: string;
  antiguidade: number;
  clan: string;
  rang: number;
  rang_temp: number;
  silver: number;
  gold: number;
  premiumaccount: number;
  admin: number;
  online: number;
  character_num: number;
  profile: string;
  see_team: number;
  see_badges: number;
  rank: number;
  number_of_pokemon: number;
  badges: number;
  won: number;
  lost: number;
  date: string;
  karma: number;
  email: string;
  ip_registered: string;
  ip_loggedin: string;
  badge_case: number;
}

export interface ProfileStats {
  pokes100: number;
  top3: number;
  top2: number;
  top1: number;
  inHouse: number;
}

export interface ProfileFriend {
  friend_id: number;
  friend_username: string;
  date: string;
}

export interface ProfileHonor {
  id: number;
  u_honor: number;
  date: string;
  honorer_username: string;
}

export interface TeamPokemon {
  id: number;
  wild_id: number;
  naam: string;
  type1: string;
  type2?: string;
  level: number;
  opzak_nummer: number;
}

export interface RankMedal {
  medal: string | null;
  text: string;
}

export interface ProfileFormatted {
  date: string;
  silver: string;
  gold: string;
}

export interface GetUserProfileResponse {
  success: boolean;
  data: {
    profile: UserProfile;
    stats: ProfileStats;
    friends: ProfileFriend[];
    honor: ProfileHonor[];
    teamPokemon: TeamPokemon[];
    badges: any;
    onlineStatus: string;
    onlineIcon: string;
    rankMedal: RankMedal;
    rankTempMedal: RankMedal;
    formatted: ProfileFormatted;
  };
}
