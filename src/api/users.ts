import { api } from "../libs/axios";
import type { UserDetails } from "../types";

export const getMe = async () => {
  const { data } = await api.get<UserDetails>("/users/me");
  return data;
};
