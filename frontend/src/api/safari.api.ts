import { axiosInstance } from "./axios";

export interface MapInfo {
  success: boolean;
  mapId: number;
  name: string;
  start_x: number;
  start_y: number;
  tileArray: Array<number[]>;
  message: string;
}

export interface UserOnMap {
  success: boolean;
  users: MapUser[];
  count: number;
}
export interface MapUser {
  username: string;
  id: number;
  x: number;
  y: number;
  sprite: string;
  in_battle: boolean;
  map_wild?: number;
}

export interface MoveResponse {
    success: boolean;
    wildEncounter: {
        id: number,
        name: string,
        level: number
    },
    message: string;
}

export const moveOnMap = async (map: number, x: number, y: number): Promise<MoveResponse> => {
  const { data } = await axiosInstance.post<MoveResponse>(`/safari/move`, {
    map,
    x,
    y,
  });
  return data;
};
