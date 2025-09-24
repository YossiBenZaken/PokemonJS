import { axiosInstance } from "./axios";

export type MoveMethod = 'tutor' | 'reminder';

export interface MovePrice {
  silver: number;
  gold: number;
}

export interface AvailableMove {
  name: string;
  type: string | null;
  price: MovePrice;
}

export interface ListMovesResponse {
  success: boolean;
  data?: {
    moves: AvailableMove[];
    pokemonId: number;
    method: MoveMethod;
  };
  message?: string;
}

export interface LearnMoveResponse {
  success: boolean;
  needSlot?: boolean;
  currentMoves?: (string | null)[];
  message: string;
}

export const listAvailableMoves = async (pokemonId: number, method: MoveMethod): Promise<ListMovesResponse> => {
  const { data } = await axiosInstance.get(`/moves/list/${pokemonId}?method=${method}`);
  return data;
};

export const learnMove = async (
  userId: number,
  pokemonId: number,
  moveName: string,
  method: MoveMethod,
  replaceSlot?: 'aanval_1' | 'aanval_2' | 'aanval_3' | 'aanval_4'
): Promise<LearnMoveResponse> => {
  const { data } = await axiosInstance.post(`/moves/learn`, {
    userId,
    pokemonId,
    moveName,
    method,
    replaceSlot
  });
  return data;
};


