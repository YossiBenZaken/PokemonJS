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
  blocked_time: string;
  reasonblocked: string;
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

export interface BannedIP {
  ip: string;
  user_id: number | null;
  tot: string;
  reden: string;
}

export interface BanIPRequest {
  ip: string;
  userId: string | null;
  until: string;
  reason: string;
}

export interface GetBannedIPsResponse {
  success: boolean;
  ips: BannedIP[];
}

export interface AccountByIP {
  acc_id: number;
  username: string;
  ip_registered: string;
  ip_loggedin: string;
  email: string;
}

export interface SearchAccountsByIPResponse {
  success: boolean;
  accounts: AccountByIP[];
  searchType: string;
}

export interface MultiAccount {
  ip: string;
  count: number;
  accounts: string[];
  accountIds?: number[];
}

export interface DetectMultiAccountsResponse {
  success: boolean;
  type: string;
  multiAccounts: MultiAccount[];
  total: number;
}

export interface BankLog {
  id: number;
  sender: string;
  reciever: string;
  date: string;
  what: string;
  amount: number;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}


export interface Message {
  datum: string;
  afzender_id: number;
  ontvanger_id: number;
  bericht: string;
  onderwerp: string;
  username: string;
}

export interface GetBankLogsResponse {
  success: boolean;
  bankLogs: BankLog[];
  messages: Message[];
  pagination: Pagination;
}

export interface GetTransferListLogsResponse {
  success: boolean;
  logs: TransferListLog[];
  pagination: Pagination;
}

export interface TransferListLog {
  id: number;
  buyer: string;
  seller: string;
  date: string;
  wild_id: number;
  level: number;
  silver: number;
  gold: number;
  real_id: number;
  pokemon_name: string;
}

export interface LevelMove {
  level: number;
  attack: string;
}

export interface CreatePokemonRequest {
  id: number;
  zona: string;
  nome: string;
  raridade: number;
  evolutie: number;
  type1: string;
  type2?: string;
  local: string;
  captura: number;
  exp: string;
  baseexp: number;
  atack1: string;
  atack2: string;
  atack3: string;
  atack4: string;
  atkbase: number;
  defbase: number;
  spatkbase: number;
  spdefbase: number;
  speedbase: number;
  hpbase: number;
  effortatk: number;
  effortdef: number;
  effortspatk: number;
  effortspdef: number;
  effortspeed: number;
  efforthp: number;
  aparece: string;
  lendario: number;
  comerciantes: string;
  levelMoves?: LevelMove[];
  movetutor?: string[];
  relacionados?: string[];
}

export interface TMHM {
  naam: string;
  omschrijving: string;
}

export interface MoveTutor {
  naam: string;
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

// IP ban functions
export const banIP = async (data: BanIPRequest): Promise<BanPlayerResponse> => {
  const { data: response } = await axiosInstance.post("/admin/ban-ip", data);
  return response;
};

export const unbanIP = async (ip: string): Promise<BanPlayerResponse> => {
  const { data } = await axiosInstance.post("/admin/unban-ip", { ip });
  return data;
};

export const getBannedIPs = async (): Promise<GetBannedIPsResponse> => {
  const { data } = await axiosInstance.get("/admin/banned-ips");
  return data;
};

export const searchAccountsByIP = async (
  ip: string,
  type: "login" | "register" = "login"
): Promise<SearchAccountsByIPResponse> => {
  const { data } = await axiosInstance.get("/admin/search-by-ip", {
    params: { ip, type },
  });
  return data;
};

export const detectMultiAccounts = async (
  type: "login" | "register" = "login",
  limit: number = 50
): Promise<DetectMultiAccountsResponse> => {
  const { data } = await axiosInstance.get("/admin/detect-multi-accounts", {
    params: { type, limit },
  });
  return data;
};

export const getBankLogs  = async (
  page: number = 1,
  limit: number = 50
): Promise<GetBankLogsResponse> => {
  const { data } = await axiosInstance.get("/admin/combined-logs", {
    params: { page, limit },
  });
  return data;
};

// Transfer list logs functions
export const getTransferListLogs = async (
  page: number = 1,
  limit: number = 50
): Promise<GetTransferListLogsResponse> => {
  const { data } = await axiosInstance.get("/admin/transferlist-logs", {
    params: { page, limit },
  });
  return data;
};

export const getTransferListLogsByUser = async (
  username: string,
  page: number = 1,
  limit: number = 50
): Promise<GetTransferListLogsResponse> => {
  const { data } = await axiosInstance.get("/admin/transferlist-logs-by-user", {
    params: { username, page, limit },
  });
  return data;
};

// Pokemon management functions
export const createPokemon = async (data: CreatePokemonRequest): Promise<BanPlayerResponse> => {
  const { data: response } = await axiosInstance.post("/admin/create-pokemon", data);
  return response;
};

export const getTMHMList = async (): Promise<{ success: boolean; tmList: TMHM[] }> => {
  const { data } = await axiosInstance.get("/admin/tm-hm-list");
  return data;
};

export const getMoveTutorList = async (): Promise<{ success: boolean; tutorList: MoveTutor[] }> => {
  const { data } = await axiosInstance.get("/admin/move-tutor-list");
  return data;
};

// Give egg functions
export interface GiveEggRequest {
  userId: number;
  eggType: number;
  region: string;
}
export interface GivePokemonRequest {
  userId: number;
  wildId: number;
  isEgg:string
  level: number;
  maxIV: number;
  minIV: number;
}

export interface GiveEggResponse {
  success: boolean;
  message: string;
  pokemon?: {
    name: string;
    level: number;
    character: string;
  };
}

export const giveEgg = async (data: GiveEggRequest): Promise<GiveEggResponse> => {
  const { data: response } = await axiosInstance.post("/admin/give-egg", data);
  return response;
};
export const givePokemon = async (data: GivePokemonRequest): Promise<GiveEggResponse> => {
  const { data: response } = await axiosInstance.post("/admin/give-pokemon", data);
  return response;
};

export interface PokemonDetails {
  wild_id: number;
  naam: string;
  type1: string;
}

export const getPokemons = async(): Promise<PokemonDetails[]> => {
  const { data: response } = await axiosInstance.get("/admin/getPokemons");
  return response;
}

// Donate to all players
export interface DonateResponse {
  success: boolean;
  message: string;
  playersAffected?: number;
}

export const giveSilverToAll = async (amount: number): Promise<DonateResponse> => {
  const { data } = await axiosInstance.post("/admin/give-silver-all", { amount });
  return data;
};

export const giveGoldToAll = async (amount: number): Promise<DonateResponse> => {
  const { data } = await axiosInstance.post("/admin/give-gold-all", { amount });
  return data;
};

export const givePremiumToAll = async (days: number): Promise<DonateResponse> => {
  const { data } = await axiosInstance.post("/admin/give-premium-all", { days });
  return data;
};

export const givePremiumToPlayer = async (
  username: string,
  days: number,
  adminUsername: string
): Promise<DonateResponse> => {
  const { data } = await axiosInstance.post("/admin/give-premium-player", {
    username,
    days,
    adminUsername,
  });
  return data;
};