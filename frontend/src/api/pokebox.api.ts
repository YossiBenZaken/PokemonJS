import { axiosInstance } from "./axios";

export interface Pokemon {
  id: number;
  wild_id: number;
  naam: string;
  level: number;
  type1: string;
  type2?: string;
  shiny: number;
  ei: number;
  opzak: string;
  opzak_nummer: number;
  roepnaam?: string;
  item?: string;
  top3?: string;
}

export interface BoxSlot {
  slotNumber: number;
  pokemon: Pokemon | null;
}

export interface HouseInfo {
  name: string;
  capacity: number;
  image: string;
  spotsLeft: number;
}

export interface BoxStats {
  pokemonsInStorage: number;
  level100Pokemon: number;
  top1Pokemon: number;
  top2Pokemon: number;
  top3Pokemon: number;
}

export interface BoxConfig {
  number: number;
  maxBoxes: number;
  name: string | null;
  background: string;
}

export interface User {
  huis: string;
  inHand: number;
}

export interface BoxInfoResponse {
  success: boolean;
  data?: {
    user: User;
    house: HouseInfo;
    stats: BoxStats;
    teamPokemons: Pokemon[];
    box: BoxConfig;
  };
  message?: string;
}

export interface BoxPokemonsResponse {
  success: boolean;
  data?: {
    slots: BoxSlot[];
    boxNumber: number;
    slotRange: {
      start: number;
      end: number;
    };
  };
  message?: string;
}

export interface MovePokemonRequest {
  userId: number;
  pokemonId: number;
  from: 'team' | 'box';
  to: 'team' | 'box';
  toSlot?: number;
}

export interface MovePokemonResponse {
  success: boolean;
  message: string;
}

export interface ConfigureBoxRequest {
  userId: number;
  boxNumber: number;
  name?: string;
  background?: string;
}

export interface ConfigureBoxResponse {
  success: boolean;
  message: string;
}

export interface SellPokemonRequest {
  userId: number;
  pokemonId: number;
}

export interface SellPokemonResponse {
  success: boolean;
  message: string;
  silverEarned?: number;
}

export interface ReleasePokemonRequest {
  userId: number;
  pokemonId: number;
}

export interface ReleasePokemonResponse {
  success: boolean;
  message: string;
}

// API functions
export const getBoxInfo = async (userId: number, boxNumber: number = 1): Promise<BoxInfoResponse> => {
  const { data } = await axiosInstance.get(`/pokebox/info/${userId}/${boxNumber}`);
  return data;
};

export const getBoxPokemons = async (userId: number, boxNumber: number = 1): Promise<BoxPokemonsResponse> => {
  const { data } = await axiosInstance.get(`/pokebox/pokemons/${userId}/${boxNumber}`);
  return data;
};

export const movePokemon = async (request: MovePokemonRequest): Promise<MovePokemonResponse> => {
  const { data } = await axiosInstance.post("/pokebox/move", request);
  return data;
};

export const configureBox = async (request: ConfigureBoxRequest): Promise<ConfigureBoxResponse> => {
  const { data } = await axiosInstance.post("/pokebox/configure", request);
  return data;
};

export const sellPokemon = async (request: SellPokemonRequest): Promise<SellPokemonResponse> => {
  const { data } = await axiosInstance.post("/pokebox/sell", request);
  return data;
};

export const releasePokemon = async (request: ReleasePokemonRequest): Promise<ReleasePokemonResponse> => {
  const { data } = await axiosInstance.post("/pokebox/release", request);
  return data;
};

// Helper functions
export const getHouseDisplayName = (houseType: string): string => {
  const houses: Record<string, string> = {
    'doos': 'קופסה',
    'shuis': 'בית קטן',
    'nhuis': 'בית רגיל',
    'villa': 'וילה גדולה'
  };
  return houses[houseType] || 'לא ידוע';
};

export const getHouseUpgradeMessage = (houseType: string): string => {
  if (houseType === 'villa') {
    return 'יש לך את הבית הכי גדול!';
  }
  return 'אם הקופסה מתמלאת, קנה כאן בית גדול יותר!';
};

export const getPokemonImageUrl = (pokemon: Pokemon, baseUrl: string): string => {
  if (pokemon.ei === 1) {
    return `${baseUrl}/images/icons/egg.gif`;
  }
  
  const type = pokemon.shiny === 1 ? 'shiny' : 'pokemon';
  return `${baseUrl}/images/${type}/icon/${pokemon.wild_id}.gif`;
};

export const getPokemonDisplayName = (pokemon: Pokemon): string => {
  return pokemon.roepnaam || pokemon.naam;
};

export const getPokemonTypeColor = (type1: string, type2?: string): string => {
  const typeColors: Record<string, string> = {
    'Normal': '#A8A878',
    'Fire': '#F08030',
    'Water': '#6890F0',
    'Electric': '#F8D030',
    'Grass': '#78C850',
    'Ice': '#98D8D8',
    'Fighting': '#C03028',
    'Poison': '#A040A0',
    'Ground': '#E0C068',
    'Flying': '#A890F0',
    'Psychic': '#F85888',
    'Bug': '#A8B820',
    'Rock': '#B8A038',
    'Ghost': '#705898',
    'Dragon': '#7038F8',
    'Dark': '#705848',
    'Steel': '#B8B8D0',
    'Fairy': '#EE99AC'
  };
  
  return typeColors[type1] || '#68A090';
};

export const getTopMedalIcon = (topLevel: string, baseUrl: string): string => {
  const medals: Record<string, string> = {
    '1': 'medal1.png',
    '2': 'medal2.png',
    '3': 'medal3.png'
  };
  
  const medalFile = medals[topLevel];
  return medalFile ? `${baseUrl}/images/icons/${medalFile}` : '';
};

export const formatPokemonTooltip = (pokemon: Pokemon): string => {
  const displayName = getPokemonDisplayName(pokemon);
  const types = pokemon.type2 ? `${pokemon.type1}/${pokemon.type2}` : pokemon.type1;
  const shinyText = pokemon.shiny === 1 ? ' (שיני)' : '';
  const eggText = pokemon.ei === 1 ? ' (ביצה)' : '';
  
  return `${displayName} - רמה ${pokemon.level} - ${types}${shinyText}${eggText}`;
};