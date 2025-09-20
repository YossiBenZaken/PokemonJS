import axios from './axios';

export interface FountainTeamMon {
  id: number;
  wild_id: number;
  naam: string;
  poke_reset: number;
  zeldzaamheid: number;
  price_basic: number;
  price_premium: number;
  ei: number;
}

export const fountainApi = {
  getTeam: async (userId: number): Promise<{ team: FountainTeamMon[]; isPremiumAcc: boolean }> => {
    const res = await axios.get('/fountain/team?userId='+userId);
    return { team: res.data.team ?? [], isPremiumAcc: !!res.data.isPremiumAcc };
  },
  resetBasic: async (pokemonId: number, userId: number): Promise<{ success: boolean; price: number }> => {
    const res = await axios.post('/fountain/reset/basic', { pokemonId,userId });
    return res.data;
  },
  resetPremium: async (pokemonId: number, userId: number): Promise<{ success: boolean; price: number; returns?: Array<{ item: string; qty: number }> }> => {
    const res = await axios.post('/fountain/reset/premium', { pokemonId, userId });
    return res.data;
  },
};


