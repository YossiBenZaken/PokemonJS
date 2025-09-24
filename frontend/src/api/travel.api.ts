import { axiosInstance } from "./axios";

export type RegionKey = 'kanto' | 'johto' | 'hoenn' | 'sinnoh' | 'unova' | 'kalos' | 'alola';

export interface TravelPrices {
  perPokemon: number;
  total: number;
  time: number;
}

export interface TravelInfoResponse {
  success: boolean;
  data?: {
    world: string;
    in_hand: number;
    silver: number;
    premiumActive: boolean;
    prices: Record<RegionKey, TravelPrices>;
    regions: RegionKey[];
  };
  message?: string;
}

export interface TravelActionResponse {
  success: boolean;
  message: string;
}

export const getTravelInfo = async (userId: number): Promise<TravelInfoResponse> => {
  const { data } = await axiosInstance.get(`/travel/info/${userId}`);
  return data;
};

export const go = async (userId: number, region: RegionKey): Promise<TravelActionResponse> => {
  const { data } = await axiosInstance.post(`/travel/go`, { userId, region });
  return data;
};

export const surf = async (userId: number, region: RegionKey, pokemonId: number): Promise<TravelActionResponse> => {
  const { data } = await axiosInstance.post(`/travel/surf`, { userId, region, pokemonId });
  return data;
};

export const fly = async (userId: number, region: RegionKey, pokemonId: number): Promise<TravelActionResponse> => {
  const { data } = await axiosInstance.post(`/travel/fly`, { userId, region, pokemonId });
  return data;
};


