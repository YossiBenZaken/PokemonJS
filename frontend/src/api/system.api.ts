import { Attack } from "../models/attack.model";
import { Karakter } from "../models/karakter.model";
import { axiosInstance } from "./axios";

export interface OnlineUser {
  user_id: number;
  username: string;
  premiumaccount: number;
  admin: number;
  rang: number;
  dv: number;
}

export interface GetOnlineUsersResponse {
  success: boolean;
  users: OnlineUser[];
  total: number;
}

export interface GetAssetsResponse {
  success: boolean;
  data: {
    ranks: any[];
    karakters: Karakter[];
    attacks: Attack[];
  };
}

export interface GetOfficialMessageResponse {
  success: boolean;
  data: {
    id: number,
    title: string,
    message: string,
    date: string,
    is_read: boolean
  }[]
}

export const getOnlineUsers = async (): Promise<GetOnlineUsersResponse> => {
  const { data } = await axiosInstance.get("/system/online");
  return data;
};

export const getAssets = async (): Promise<GetAssetsResponse> => {
  const { data } = await axiosInstance.get("/system/assets");
  return data;
};

export const updateTickets = async (
  delta: number,
  userId: number
): Promise<{
  success: boolean;
  tickets: number;
}> => {
  const { data } = await axiosInstance.post("/system/tickets", {
    delta,
    userId,
  });
  return data;
};

export const getOfficialMessage = async (userId: number,messageId?: string): Promise<GetOfficialMessageResponse> => {
  let url = '/system/official-messages';
  const {data} = await axiosInstance.post(url, {
    id: messageId,
    userId
  });
  return data;
}