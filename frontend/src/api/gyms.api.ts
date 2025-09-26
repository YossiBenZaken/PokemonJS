import { axiosInstance } from "./axios";

export interface Gym {
  id: number;
  naam: string;
  namePublic: string;
  badge: string;
  descr: string;
  wereld: string;
  gebied: string;
  rankRequired: number;
  progress: number;
  blocked: boolean;
  complete: boolean;
  index: number;
}

export interface GetGymsResponse {
  success: boolean;
  data: {
    gyms: Gym[];
    next: number;
  };
}

export interface PostChallengeResponse {
  success: boolean;
  message?: string;
  redirect?: string;
}

/**
 * Get all gyms available for the current user.
 */
export const getGyms = async (userId: number | undefined): Promise<GetGymsResponse> => {
  const { data } = await axiosInstance.post<GetGymsResponse>("/gyms", {userId});
  return data;
};

/**
 * Challenge a gym leader.
 * @param gymLeader - The name of the gym leader to challenge
 */
export const postChallenge = async (
  gymLeader: string,
  userId: number | undefined
): Promise<PostChallengeResponse> => {
  const { data } = await axiosInstance.post<PostChallengeResponse>(
    "/gyms/challenge",
    {
      gymLeader,
      userId
    }
  );
  return data;
};
