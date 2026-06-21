import { api } from "../libs/axios";
import type { Passbook } from "../types";

export const addMoney = async (amount: number) => {
  const { data } = await api.post("/wallet/add", { amount });
  return data;
};

export const withdraw = async (amount: number) => {
  const { data } = await api.post("/wallet/withdraw", { amount });
  return data;
};

export const getPassbook = async (page = 1, limit = 20) => {
  const { data } = await api.get<Passbook>("/wallet/passbook", {
    params: { page, limit },
  });
  return data;
};
