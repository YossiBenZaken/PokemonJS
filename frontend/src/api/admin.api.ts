import {axiosInstance} from './axios';

const prefix = '/admin';

export interface AdminsTeamResponse {
    owners: {
        username: string
    }[];
    administrators: {
        username: string
    }[];
    moderators: {
        username: string
    }[];
}

export const getAdminsTeams = async(): Promise<AdminsTeamResponse> => {
    const {data} = await axiosInstance.get<AdminsTeamResponse>(`${prefix}/getAdmins`);
    return data;
}

export const removeAdmin = async(username: string): Promise<{success: boolean}> => {
    const {data} = await axiosInstance.post(`${prefix}/removeAdmin`,{
        username
    });
    return data;
}