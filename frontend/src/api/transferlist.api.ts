import { axiosInstance } from "./axios";

export interface TransferListItem {
  id: number;
  tid: number;
  naam: string;
  level: number;
  karakter: string;
  ability: string;
  powertotal: number;
  item: string | null;
  silver: number;
  gold: number;
  datum: string;
  owner: string;
  user_id: number;
  negociavel: boolean;
  shiny: number;
  type: string;
  lances?: number;
  time_end?: number;
  animatie: string;
  roepnaam: string;
  icon: string;
}

export interface FiltersDataResponse {
  data: FiltersData;
  success: boolean;
}

export interface FiltersData {
  species: Array<{ wild_id: number; naam: string; real_id: number }>;
  items: Array<{ naam: string }>;
  regions: string[];
}

export const getFilteredData = async (): Promise<FiltersData> => {
  const { data } = await axiosInstance.get<FiltersDataResponse>(
    "/transferlist/filters"
  );
  return data.data;
};
export const getTransferList = async (
  params: URLSearchParams
): Promise<TransferListItem[]> => {
  const { data } = await axiosInstance.get<{
    data: TransferListItem[],
    success: boolean
  }>(
    `/transferlist?${params}`
  );
  return data.data;
};

export const buyPokemon = async (transferId: string) => {
  return await axiosInstance.post<{pokemonId: number}>("/transferlist/buy", { transferId });
};

export const deletePokemon = async(pokemonId: number) => {
    await axiosInstance.delete(`/transferlist/${pokemonId}`);
}