import { api } from "../libs/axios";
import type { AuthResponse, RequestOtpResponse } from "../types";

export const requestOtp = async (mobile: string) => {
  const { data } = await api.post<RequestOtpResponse>("/auth/request-otp", {
    mobile,
  });
  return data;
};

export const verifyOtp = async (payload: { mobile: string; code: string; name?: string }) => {
  const { data } = await api.post<AuthResponse>("/auth/verify-otp", payload);
  return data;
};
