import { axiosInstance } from "./axios";

export interface PokedexSummaryResponse {
  success: boolean;
  data?: { hasPokedex: boolean; seen: number; owned: number; total: number };
  message?: string;
}

export const getSummary = async (userId: number): Promise<PokedexSummaryResponse> => {
  const { data } = await axiosInstance.get(`/pokedex/summary/${userId}`);
  return data;
};

export const getRarities = async () => {
  const { data } = await axiosInstance.get(`/pokedex/rarities`);
  return data;
};

export const listAll = async () => {
  const { data } = await axiosInstance.get(`/pokedex/list`);
  return data;
};

export const getPokemon = async (id: number) => {
  const { data } = await axiosInstance.get(`/pokedex/pokemon/${id}`);
  return data;
};


