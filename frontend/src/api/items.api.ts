import { Item, ItemData, ItemWithQuantity, SellItemRequest, UseItemRequest } from '../models/item.model';

import axios from './axios';

export const itemsApi = {
  // קבלת נתוני הפריטים של המשתמש
  getUserItems: async (userId: string): Promise<ItemData> => {
    const response = await axios.get('/items/user-items?user_id=' + userId);
    return response.data.data;
  },

  // קבלת פריטים לפי קטגוריה
  getItemsByCategory: async (category: string): Promise<Item[]> => {
    const response = await axios.get(`/items/category/${category}`);
    return response.data;
  },

  // קבלת פריטים עם כמות (למשתמש הנוכחי)
  getItemsWithQuantity: async (category: string, userId: string): Promise<ItemWithQuantity[]> => {
    const response = await axios.get(`/items/with-quantity/${category}?user_id=`+userId);
    return response.data.data;
  },

  // מכירת פריט
  sellItem: async (sellData: SellItemRequest): Promise<{ success: boolean; message?: string }> => {
    const response = await axios.post('/items/sell', sellData);
    return response.data;
  },

  // שימוש בפריט
  useItem: async (useData: UseItemRequest): Promise<{ success: boolean; message?: string }> => {
    const response = await axios.post('/items/use', useData);
    return response.data;
  },

  // קבלת פרטי פריט ספציפי
  getItemDetails: async (itemName: string): Promise<Item> => {
    const response = await axios.get(`/items/details/${itemName}`);
    return response.data;
  }
};
