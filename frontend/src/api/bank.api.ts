import { axiosInstance } from "./axios";

export interface UserBankInfo {
  username: string;
  silver: number;
  gold: number;
  rank: number;
  clan: number | null;
}

export interface ClanInfo {
  silvers: number;
  golds: number;
}

export interface BankInfoResponse {
  success: boolean;
  data?: {
    user: UserBankInfo;
    clan: ClanInfo | null;
  };
  message?: string;
}

export interface TransferRequest {
  userId: number;
  receiver?: string;
  amount: number;
  currency: 'silver' | 'gold';
}

export interface TransferResponse {
  success: boolean;
  message: string;
}

export interface Transaction {
  id: number;
  date: string;
  sender: string;
  reciever: string;
  amount: number;
  what: 'silver' | 'gold';
}

export interface TransactionHistoryResponse {
  success: boolean;
  data?: {
    transactions: Transaction[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
  message?: string;
}

export const getBankInfo = async (userId: number): Promise<BankInfoResponse> => {
  const { data } = await axiosInstance.get(`/bank/info/${userId}`);
  return data;
};

export const transferToPlayer = async (
  transferData: TransferRequest
): Promise<TransferResponse> => {
  const { data } = await axiosInstance.post("/bank/transfer-player", transferData);
  return data;
};

export const transferToClan = async (
  transferData: Omit<TransferRequest, 'receiver'>
): Promise<TransferResponse> => {
  const { data } = await axiosInstance.post("/bank/transfer-clan", transferData);
  return data;
};

export const getTransactionHistory = async (
  userId: number,
  page: number = 1,
  limit: number = 50
): Promise<TransactionHistoryResponse> => {
  const { data } = await axiosInstance.get(
    `/bank/history/${userId}?page=${page}&limit=${limit}`
  );
  return data;
};