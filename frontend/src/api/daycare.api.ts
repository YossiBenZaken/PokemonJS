import { axiosInstance } from "./axios";

export interface Pokemon {
  id: number;
  wild_id: number;
  naam: string;
  type1: string;
  type2?: string;
  level: number;
  shiny: string;
  opzak_nummer: number;
  karakter: string;
  roepnaam?: string;
  icon?: string;
  ei?: string;
  ei_tijd?: string;
}

export interface DaycarePokemon {
  pokemonid: number;
  user_id: number;
  naam: string;
  level: number;
  levelup: number;
  wild_id: number;
  shiny: string;
}

export interface Egg {
  pokemonid: number;
  user_id: number;
  naam: string;
  level: number;
  levelup: string; // '1' for shiny, '0' for normal
  ei: string;
}

export interface User {
  inHand: number;
  isPremium: boolean;
  maxSlots: number;
  silver: number;
}

export interface DaycareStatus {
  egg: Egg | null;
  daycarePokemons: DaycarePokemon[];
  teamPokemons: Pokemon[];
  user: User;
}

export interface DaycareStatusResponse {
  success: boolean;
  data?: DaycareStatus;
  message?: string;
}

export interface AcceptEggResponse {
  success: boolean;
  message: string;
  pokemon?: {
    name: string;
    shiny: boolean;
  };
}

export interface RejectEggResponse {
  success: boolean;
  message: string;
}

export interface LeavePokemonResponse {
  success: boolean;
  message: string;
}

export interface TakePokemonResponse {
  success: boolean;
  message: string;
  levelUps?: number;
  cost?: number;
  userSilver?: number;
}

export const getDaycareStatus = async (userId: number): Promise<DaycareStatusResponse> => {
  const { data } = await axiosInstance.get(`/daycare/status/${userId}`);
  return data;
};

export const acceptEgg = async (userId: number): Promise<AcceptEggResponse> => {
  const { data } = await axiosInstance.post("/daycare/accept-egg", { userId });
  return data;
};

export const rejectEgg = async (userId: number): Promise<RejectEggResponse> => {
  const { data } = await axiosInstance.post("/daycare/reject-egg", { userId });
  return data;
};

export const leavePokemonAtDaycare = async (
  userId: number, 
  pokemonId: number
): Promise<LeavePokemonResponse> => {
  const { data } = await axiosInstance.post("/daycare/leave-pokemon", {
    userId,
    pokemonId
  });
  return data;
};

export const takePokemonFromDaycare = async (
  userId: number, 
  pokemonId: number
): Promise<TakePokemonResponse> => {
  const { data } = await axiosInstance.post("/daycare/take-pokemon", {
    userId,
    pokemonId
  });
  return data;
};