import { axiosInstance } from "./axios";

export interface Pokemon {
  id: number;
  naam: string;
  wild_id: number;
  level: number;
  zeldzaamheid: number;
  shiny: number;
  ei: number;
  opzak: string;
  user_id: number;
  humor_change: number;
  naam_changes: number;
  roepnaam?: string;
  karakter: string;
  // Base stats
  attack_base: number;
  defence_base: number;
  speed_base: number;
  hp_base: number;
  'spc.attack_base': number;
  'spc.defence_base': number;
  // IVs
  attack_iv: number;
  defence_iv: number;
  speed_iv: number;
  hp_iv: number;
  'spc.attack_iv': number;
  'spc.defence_iv': number;
  // EVs
  attack_ev: number;
  defence_ev: number;
  speed_ev: number;
  hp_ev: number;
  'spc.attack_ev': number;
  'spc.defence_ev': number;
  // Stat ups
  attack_up: number;
  defence_up: number;
  speed_up: number;
  hp_up: number;
  spc_up: number;
}

export interface Nature {
  karakter_naam: string;
  attack_add: number;
  defence_add: number;
  speed_add: number;
  'spc.attack_add': number;
  'spc.defence_add': number;
}

export interface User {
  username: string;
  rank: number;
  silver: number;
  gold: number;
  isPremium: boolean;
}

export interface SpecialistInfoResponse {
  success: boolean;
  data?: {
    user: User;
    teamPokemons: Pokemon[];
    natures: Nature[];
  };
  message?: string;
}

export interface SpecialistActionResponse {
  success: boolean;
  message: string;
  goldSpent?: number;
  silverSpent?: number;
  needed?: number;
  current?: number;
}

// Shiny specialist
export const getSpecialistInfo = async (userId: number): Promise<SpecialistInfoResponse> => {
  const { data } = await axiosInstance.get(`/specialists/info/${userId}`);
  return data;
};

export const makeShiny = async (userId: number, pokemonIds: number[]): Promise<SpecialistActionResponse> => {
  const { data } = await axiosInstance.post("/specialists/shiny", {
    userId,
    pokemonIds
  });
  return data;
};

// Nickname specialist
export const changeNickname = async (
  userId: number, 
  pokemonData: Record<number, string>,
  removeNames: boolean = false
): Promise<SpecialistActionResponse> => {
  const { data } = await axiosInstance.post("/specialists/nickname", {
    userId,
    pokemonData,
    removeNames
  });
  return data;
};

// Nature specialists
export const changeNatureRandom = async (
  userId: number, 
  pokemonIds: number[]
): Promise<SpecialistActionResponse> => {
  const { data } = await axiosInstance.post("/specialists/nature-random", {
    userId,
    pokemonIds
  });
  return data;
};

export const changeNatureTargeted = async (
  userId: number, 
  pokemonIds: number[],
  changeType: 'up' | 'down',
  attribute: 'attack' | 'defense' | 'spatk' | 'spdef' | 'speed'
): Promise<SpecialistActionResponse> => {
  const { data } = await axiosInstance.post("/specialists/nature-targeted", {
    userId,
    pokemonIds,
    changeType,
    attribute
  });
  return data;
};

export const changeNatureExact = async (
  userId: number, 
  pokemonIds: number[],
  natureName: string
): Promise<SpecialistActionResponse> => {
  const { data } = await axiosInstance.post("/specialists/nature-exact", {
    userId,
    pokemonIds,
    natureName
  });
  return data;
};

// Helper functions for cost calculation
export const calculateShinyCost = (rarity: number, isPremium: boolean): number => {
  const costs: Record<number, [number, number]> = {
    1: [20, 15],
    2: [35, 27], 
    3: [50, 38],
  };
  const [normal, premium] = costs[rarity] || [120, 90];
  return isPremium ? premium : normal;
};

export const calculateNicknameCost = (
  rarity: number, 
  nameChanges: number, 
  isPremium: boolean
): number => {
  if (isPremium) return 0;
  
  const baseCosts: Record<number, number> = {
    1: 250,
    2: 350,
    3: 400,
  };
  const baseCost = baseCosts[rarity] || 600;
  
  return nameChanges > 0 ? baseCost * nameChanges : baseCost;
};

export const calculateNatureCost = (
  humorChanges: number, 
  isPremium: boolean, 
  serviceType: 'random' | 'targeted' | 'exact'
): number => {
  if (serviceType === 'exact') {
    return humorChanges > 0 ? 0 : 250; // Only works on unchanged Pokemon
  }
  
  if (serviceType === 'targeted') {
    if (humorChanges === 0) return 50;
    if (humorChanges === 1) return 80;
    return 130;
  }
  
  // Random service
  if (humorChanges === 0) return isPremium ? 26 : 30;
  if (humorChanges === 1) return isPremium ? 43 : 50;
  return isPremium ? 85 : 100;
};

// Hebrew attribute names
export const ATTRIBUTE_NAMES: Record<string, string> = {
  attack: 'התקפה',
  defense: 'הגנה', 
  spatk: 'התקפה מיוחדת',
  spdef: 'הגנה מיוחדת',
  speed: 'מהירות'
};

// Service type names in Hebrew
export const SERVICE_NAMES: Record<string, string> = {
  shiny: 'מומחה שיני',
  nickname: 'מומחה שמות',
  nature_random: 'מומחה אופי - רנדומלי',
  nature_targeted: 'מומחה אופי - פרימיום',
  nature_exact: 'מומחה אופי - מקצועי'
};