import { LoginRequest } from "../models/login.model";
import { RegisterRequest } from "../models/register.model";
import api from "./axios";

const prefix = '/auth';

export const Login = async (request: LoginRequest) => {
  try {
    const response = await api.post(`${prefix}/login`, request.toJSON());
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const Register = async (request: RegisterRequest) => {
  try {
    const response = await api.post(`${prefix}/register`, request.toJSON());
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const AuthToken = async () => {
  try {
    const user_id = JSON.parse(localStorage.getItem('game_session') || '{}').user_id;
    const response = await api.post(`${prefix}/auth-token`, { user_id: user_id });
    return response.data;
  } catch (error: any) {
    return error.response.data;
  }
};
