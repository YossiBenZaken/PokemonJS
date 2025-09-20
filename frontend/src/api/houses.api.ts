import api from "./axios";

const prefix = '/houses';

// קבלת רשימת כל הבתים
export const getHouses = async () => {
  try {
    const response = await api.get(`${prefix}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// קבלת בית ספציפי
export const getHouse = async (houseId: string) => {
  try {
    const response = await api.get(`${prefix}/${houseId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// קניית בית
export const buyHouse = async (houseId: string, userId: string) => {
  try {
    const response = await api.post(`${prefix}/buy`, {
      houseId,
      userId
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// קבלת סטטוס הבתים עבור משתמש
export const getHouseStatus = async (userId: string) => {
  try {
    const response = await api.get(`${prefix}/status/${userId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message);
  }
};
