import { useQuery } from "@tanstack/react-query";
import { getMe } from "../api/users";

export const useUser = () => {
  return useQuery({
    queryKey: ["me"],
    queryFn: getMe,
  });
};
