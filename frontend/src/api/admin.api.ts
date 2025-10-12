import { axiosInstance } from "./axios";

const prefix = "/admin";

export interface AdminsTeamResponse {
  owners: {
    username: string;
  }[];
  administrators: {
    username: string;
  }[];
  moderators: {
    username: string;
  }[];
}

export interface BannedAccount {
  accId: number;
  email: string;
  username: string;
  bannedUntil: string | null;
  reason: string;
}

export interface BannedAccountsResponse {
  success: boolean;
  data?: BannedAccount[];
  message?: string;
}

export interface BanAccountRequest {
  email: string;
  reason: string;
  banUntil?: string; // YYYY-MM-DD format, empty for permanent
}

export interface BanAccountResponse {
  success: boolean;
  message: string;
}

export interface UnbanAccountRequest {
  email: string;
}

export interface UnbanAccountResponse {
  success: boolean;
  message: string;
}

export interface BanStatus {
  isBanned: boolean;
  isPermanent: boolean;
  bannedUntil: string | null;
  reason: string;
}

export interface BanStatusResponse {
  success: boolean;
  data?: BanStatus;
  message?: string;
}

export interface BannedPlayer {
  username: string;
  bloqueado_tempo: string;
  razaobloqueado: string;
}

export interface BanPlayerRequest {
  username: string;
  reason: string;
  until?: string;
}

export interface BanPlayerResponse {
  success: boolean;
  message: string;
}

export interface GetBannedPlayersResponse {
  success: boolean;
  players: BannedPlayer[];
}

export const getAdminsTeams = async (): Promise<AdminsTeamResponse> => {
  const { data } = await axiosInstance.get<AdminsTeamResponse>(
    `${prefix}/getAdmins`
  );
  return data;
};

export const removeAdmin = async (
  username: string
): Promise<{ success: boolean }> => {
  const { data } = await axiosInstance.post(`${prefix}/removeAdmin`, {
    username,
  });
  return data;
};
export const addAdmin = async (
  username: string
): Promise<{ success: boolean }> => {
  const { data } = await axiosInstance.post(`${prefix}/addAdmin`, {
    username,
  });
  return data;
};

export const getBannedAccounts = async (): Promise<BannedAccountsResponse> => {
  const { data } = await axiosInstance.get(`/admin/bans`);
  return data;
};

// Ban an account
export const banAccount = async (
  request: BanAccountRequest
): Promise<BanAccountResponse> => {
  const { data } = await axiosInstance.post("/admin/ban", request);
  return data;
};

// Unban an account
export const unbanAccount = async (
  request: UnbanAccountRequest
): Promise<UnbanAccountResponse> => {
  const { data } = await axiosInstance.post("/admin/unban", request);
  return data;
};

// Check ban status of an account
export const checkBanStatus = async (
  email: string
): Promise<BanStatusResponse> => {
  const { data } = await axiosInstance.get(`/admin/ban-status/${email}`);
  return data;
};

// Helper function to format date for display
export const formatBanDate = (dateString: string | null): string => {
  if (!dateString) return "לצמיתות";

  const date = new Date(dateString);
  return date.toLocaleDateString("he-IL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

// Helper function to check if ban is expired
export const isBanExpired = (bannedUntil: string | null): boolean => {
  if (!bannedUntil) return false; // Permanent ban

  const banDate = new Date(bannedUntil);
  const now = new Date();
  return now > banDate;
};

export const banPlayer = async (data: BanPlayerRequest): Promise<BanPlayerResponse> => {
  const { data: response } = await axiosInstance.post("/admin/banPlayer", data);
  return response;
};

export const unbanPlayer = async (username: string): Promise<BanPlayerResponse> => {
  const { data } = await axiosInstance.post("/admin/unbanPlayer", { username });
  return data;
};

export const getBannedPlayers = async (): Promise<GetBannedPlayersResponse> => {
  const { data } = await axiosInstance.get("/admin/banned-list");
  return data;
};