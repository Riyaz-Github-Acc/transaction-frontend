import { api } from "../libs/axios";

export interface KycStatus {
  kycStatus: "NOT_STARTED" | "PENDING" | "VERIFIED" | "FAILED";
  details: {
    documentType: string;
    status: string;
    extractedName: string | null;
    documentNumber: string | null;
    verifiedAt: string | null;
  } | null;
}

export interface KycVerifyResponse {
  status: string;
  kycStatus: "VERIFIED" | "FAILED" | "PENDING";
  message: string;
  documentType: string;
  extracted: {
    name?: string;
    dob?: string;
    documentNumber?: string;
  };
}

export const verifyKyc = async (payload: {
  file: File;
  documentType: string;
  simulateOutcome: "VALID" | "FAILED" | "PENDING";
}) => {
  const form = new FormData();
  form.append("file", payload.file);
  form.append("documentType", payload.documentType);
  form.append("simulateOutcome", payload.simulateOutcome);

  const { data } = await api.post<KycVerifyResponse>("/kyc/verify", form);
  return data;
};

export const getKycStatus = async () => {
  const { data } = await api.get<KycStatus>("/kyc/status");
  return data;
};
