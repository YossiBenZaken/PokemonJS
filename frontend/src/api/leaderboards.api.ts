import { axiosInstance } from "./axios";

export interface StrongestEntry {
  id: number;
  user_id: number;
  username: string;
  wild_id: number;
  naam: string;
  powerTotal: number;
}

export interface ExperiencedEntry {
  id: number;
  user_id: number;
  username: string;
  wild_id: number;
  naam: string;
  totalexp: number;
}

export interface MillionaireEntry {
  user_id: number;
  username: string;
  character: string;
  total: number;
}

export interface CollectorEntry {
  user_id: number;
  username: string;
  character: string;
  total: number;
}

export interface DuelistEntry {
  user_id: number;
  username: string;
  character: string;
  gevechten: number;
}

export interface LeaderboardsSummaryResponse {
  success: boolean;
  data?: {
    strongest: StrongestEntry[];
    experienced: ExperiencedEntry[];
    millionaires: MillionaireEntry[];
    collectors100: CollectorEntry[];
    duelists: DuelistEntry[];
  };
  message?: string;
}

export const getLeaderboardsSummary = async (): Promise<LeaderboardsSummaryResponse> => {
  const { data } = await axiosInstance.get(`/leaderboards/summary`);
  return data;
};


