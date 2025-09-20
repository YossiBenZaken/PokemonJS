import { BuyItemRequest, BuyPokemonRequest, BuyResponse, MarketItem, UserInventory } from '../models/market.model';

import axios from './axios';

export const marketApi = {
  // קבלת פריטים לפי קטגוריה
  getMarketItems: async (category: string, page: number = 1): Promise<MarketItem[]> => {
    const response = await axios.get(`/market/items/${category}?page=${page}`);
    return response.data.data;
  },

  // קבלת מלאי המשתמש
  getUserInventory: async (userId: string): Promise<UserInventory> => {
    const response = await axios.get('/market/inventory?user_id=' + userId);
    return response.data.data;
  },

  // קניית פריט רגיל
  buyItem: async (buyData: BuyItemRequest): Promise<BuyResponse> => {

    const response = await axios.post('/market/buy-item', buyData);
    return response.data;
  },

  // קניית פוקימון
  buyPokemon: async (buyData: BuyPokemonRequest): Promise<BuyResponse> => {
    const response = await axios.post('/market/buy-pokemon', buyData);
    return response.data;
  },

  // קבלת פריטים זמינים לקנייה
  getAvailableItems: async (category: string): Promise<MarketItem[]> => {
    const response = await axios.get(`/market/available/${category}`);
    return response.data.data;
  }
};
