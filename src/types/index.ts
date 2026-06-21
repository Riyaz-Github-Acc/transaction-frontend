export interface RequestOtpResponse {
  message: string;
  isNewUser: boolean;
  otp?: string;
}

export interface AuthResponse {
  message: string;
  accessToken: string;
  user: {
    id: string;
    mobile: string;
    name: string | null;
  };
}

export interface UserDetails {
  id: string;
  mobile: string;
  name: string | null;
  isVerified: boolean;
  memberSince: string;
  wallet: { balance: string };
}

export interface Transaction {
  id: string;
  type: "CREDIT" | "DEBIT";
  amount: string;
  balanceAfter: string;
  createdAt: string;
}

export interface Passbook {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  transactions: Transaction[];
}
