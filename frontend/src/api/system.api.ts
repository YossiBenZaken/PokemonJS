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
  };
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
