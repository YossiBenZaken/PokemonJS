import { axiosInstance } from "./axios";

export interface Trader {
  eigenaar: string; // Trader name (Kayl, Wayne, Remy)
  wil: string | null; // Pokemon they want
  naam: string | null; // Pokemon they offer
  hasOffer: boolean; // Whether they have an active trade offer
}

export interface TradersResponse {
  success: boolean;
  data?: Trader[];
  message?: string;
}

export interface TradeRequest {
  userId: number;
  traderName: string;
}

export interface TradeResponse {
  success: boolean;
  message: string;
  bonusMessage?: string; // For Wayne's silver bonus
}

export interface RefreshTradersRequest {
  userId: number;
}

export interface RefreshTradersResponse {
  success: boolean;
  message: string;
}

// Trader info with localized text
export interface TraderInfo {
  name: string;
  image: string;
  noOfferText: string;
  offerTextTemplate: (wantPokemon: string, offerPokemon: string) => string;
}

// Predefined trader information
export const TRADER_INFO: Record<string, TraderInfo> = {
  'Kayl': {
    name: 'Kayl',
    image: require('../assets/images/Kayl.png'),
    noOfferText: 'אין לי כרגע פוקימונים לסחר בהם.',
    offerTextTemplate: (want, offer) => `אני מחפש ${want}. בתמורה, אני מציע ${offer}. מעוניין?`
  },
  'Wayne': {
    name: 'Wayne',
    image: require('../assets/images/Wayne.png'),
    noOfferText: 'אין לי הצעות זמינות כרגע.',
    offerTextTemplate: (want, offer) => `אני צריך ${want}! אני אתן לך ${offer} ואפילו אשלם 100 כסף עבור הטרייד!`
  },
  'Remy': {
    name: 'Remy',
    image: require('../assets/images/Remy.png'),
    noOfferText: 'אין לי הצעות זמינות כרגע.',
    offerTextTemplate: (want, offer) => `אני רוצה להחליף את ה-${offer} שלי ב-${want} שלך. מה דעתך?`
  }
};

export const getTraders = async (): Promise<TradersResponse> => {
  const { data } = await axiosInstance.get("/traders");
  return data;
};

export const executeTrade = async (tradeData: TradeRequest): Promise<TradeResponse> => {
  const { data } = await axiosInstance.post("/traders/trade", tradeData);
  return data;
};

export const refreshTraders = async (refreshData: RefreshTradersRequest): Promise<RefreshTradersResponse> => {
  const { data } = await axiosInstance.post("/traders/refresh", refreshData);
  return data;
};