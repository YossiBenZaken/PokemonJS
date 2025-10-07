import { Ability } from "../models/ability.model";
import { Attack } from "../models/attack.model";
import { ItemInfo } from "../models/item.model";
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
    abilities: Ability[];
    itemInfo: ItemInfo[];
    config: Config[];
  };
}

export interface Config {
  id: number;
  config: string;
  valor: string;
}

export interface GetOfficialMessageResponse {
  success: boolean;
  data: {
    id: number;
    title: string;
    message: string;
    date: string;
    is_read: boolean;
  }[];
}

export interface DailyBonusResponse {
  success: boolean;
  message: string;
}

export interface Quest {
  questId: number;
  type: string;
  description: string;
  progress: number;
  required: number;
  isCompleted: boolean;
  canComplete: boolean;
  rewardClaimed: boolean;
  reward: {
    quantity: number;
    item?: string;
    type: string;
    attackType?: string;
  };
  rewardItem?: string;
}

export interface DailyQuestsData {
  streak: number;
  maxStreak: number;
  itemsAvailable: number;
  quest1: Quest;
  quest2: Quest;
  canGetMasterBall: boolean;
  masterBallClaimed: boolean;
  allQuestsCompleted: boolean;
  streakCompleted: boolean;
}

export const getOnlineUsers = async (): Promise<GetOnlineUsersResponse> => {
  const { data } = await axiosInstance.get("/system/online");
  return data;
};

export const dailyBonus = async (): Promise<DailyBonusResponse> => {
  const { data } = await axiosInstance.get<DailyBonusResponse>(
    "/system/daily-bonus"
  );
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

export const getOfficialMessage = async (
  userId: number,
  messageId?: string
): Promise<GetOfficialMessageResponse> => {
  let url = "/system/official-messages";
  const { data } = await axiosInstance.post(url, {
    id: messageId,
    userId,
  });
  return data;
};

export const getDailyQuests = async (): Promise<DailyQuestsData> => {
  const { data } = await axiosInstance.get<{ data: DailyQuestsData }>(
    "/system/daily-quests"
  );
  return data.data;
};

export const completeDailyQuest = async (
  questNumber: number
): Promise<{
  success: boolean,
  message: string,
  data: {
    questCompleted: boolean;
    masterBallReceived: boolean;
    streak: number;
  };
}> => {
  const { data } = await axiosInstance.post<{
    success: boolean,
    message: string,
    data: {
      questCompleted: boolean;
      masterBallReceived: boolean;
      streak: number;
    };
  }>(
    `/system/daily-quests/complete/${questNumber}`,
    {}
  );
  return data;
};
