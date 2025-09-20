import { axiosInstance } from "./axios";

export interface GetVaultResponse {
  success: boolean;
  prize: number;
  attemptCost: number;
}

export interface TryVaultResponse {
  success: boolean;
  won: boolean;
  prize?: number;
  newPrize?: number;
  message: string;
}

export interface StartWhoIsResponse {
  success: boolean;
  wait?: boolean;
  countdown?: number;
  cost?: number;
  image?: { id: number; status: string };
  message?: string;
}

export interface GuessWhoIsResponse {
  success: boolean;
  correct: boolean;
  prize?: number;
  answer?: string;
  message: string;
}

export interface Pokemon {
  id: number;
  name: string;
}

export interface GetPokemonListResponse {
  success: boolean;
  pokemons: Pokemon[];
}

export interface SpinFortuneResponse {
  success: boolean;
  result?: number;
  type?: string;
  reward?: string | number;
  message?: string;
}

export interface StoreItem {
  id: number;
  name: string;
  type: number;
  type_val: number;
  price: number;
}

export const getVault = async (): Promise<GetVaultResponse> => {
  const { data } = await axiosInstance.get("/casino/vault");
  return data;
};

export const tryVault = async (
  userId: number,
  code1: number,
  code2: number,
  code3: number
): Promise<TryVaultResponse> => {
  const { data } = await axiosInstance.post("/casino/vault/try", {
    userId,
    code1,
    code2,
    code3,
  });
  return data;
};

export const startWhoIs = async (userId: number): Promise<StartWhoIsResponse> => {
  const { data } = await axiosInstance.post("/casino/whois/start", { userId });
  return data;
};

export const guessWhoIs = async (
  userId: number,
  guess: number,
  correctId: number
): Promise<GuessWhoIsResponse> => {
  const { data } = await axiosInstance.post("/casino/whois/guess", {
    userId,
    guess,
    correctId,
  });
  return data;
};

export const getPokemonList = async (): Promise<GetPokemonListResponse> => {
  const { data } = await axiosInstance.get("/pokemon/list");
  return data;
};

export const spinFortune = async (userId: number): Promise<SpinFortuneResponse> => {
  const { data } = await axiosInstance.post("/casino/spin", { userId });
  return data;
};

export const buyTickets = async (userId: number, quantity: number) => {
  const { data } = await axiosInstance.post("/casino/buy-tickets", { userId, quantity });
  return data;
};

export const sellTickets = async (userId: number, quantity: number) => {
  const { data } = await axiosInstance.post("/casino/sell-tickets", { userId, quantity });
  return data;
};

export const getStoreItems = async (): Promise<{ success: boolean; items: StoreItem[] }> => {
  const { data } = await axiosInstance.get("/casino/items");
  return data;
};

export const buyStoreItem = async (userId: number, itemId: number) => {
  const { data } = await axiosInstance.post("/casino/buy-item", { userId, itemId });
  return data;
};