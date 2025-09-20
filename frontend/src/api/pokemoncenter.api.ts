import axios from './axios';

export interface PcPokemon {
  id: number;
  user_id: number;
  naam: string;
  roepnaam?: string;
  icon?: string;
  shiny?: number;
  wild_id: number;
  ei: number;
  leven: number;
  levenmax: number;
  effect?: string;
  opzak?: string;
  opzak_nummer?: number;
}

export const pokemonCenterApi = {
  getHand: async (userId: number): Promise<PcPokemon[]> => {
    const res = await axios.get('/system/pc/hand?userId='+userId);
    return res.data.pokemons ?? [];
  },
  heal: async (pokemonIds: number[], userId: number): Promise<{ success: boolean; healed: number; count_time: number }> => {
    const res = await axios.post('/system/heal', { pokemonIds, userId });
    return res.data;
  },
  getCooldown: async (userId: number): Promise<{ remaining: number }> => {
    const res = await axios.get('/system/cooldown?userId='+userId);
    return res.data;
  }
};


