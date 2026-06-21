import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { verifyKyc, getKycStatus } from "../api/kyc";

type Outcome = "VALID" | "FAILED" | "PENDING";

const statusStyles: Record<string, { label: string; cls: string; dot: string }> = {
  VERIFIED: {
    label: "Verified",
    cls: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    dot: "bg-emerald-400",
  },
  PENDING: {
    label: "Under review",
    cls: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    dot: "bg-amber-400",
  },
  FAILED: {
    label: "Failed",
    cls: "border-rose-500/30 bg-rose-500/10 text-rose-300",
    dot: "bg-rose-400",
  },
  NOT_STARTED: {
    label: "Not started",
    cls: "border-neutral-700 bg-neutral-800/40 text-neutral-400",
    dot: "bg-neutral-500",
  },
};

export default function Kyc() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState("AADHAAR");
  const [outcome, setOutcome] = useState<Outcome>("VALID");

  const statusQuery = useQuery({
    queryKey: ["kyc-status"],
    queryFn: getKycStatus,
  });

  const verifyMutation = useMutation({
    mutationFn: verifyKyc,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kyc-status"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });

  const handleSubmit = () => {
    if (!file) return;
    verifyMutation.mutate({ file, documentType, simulateOutcome: outcome });
  };

  const current = statusQuery.data?.kycStatus ?? "NOT_STARTED";
  const badge = statusStyles[current] ?? statusStyles.NOT_STARTED;
  const errorMessage = (verifyMutation.error as any)?.response?.data?.message;

  return (
    <div className="min-h-screen w-full bg-neutral-950 text-neutral-100">
      <header className="border-b border-neutral-800 bg-neutral-900/40 backdrop-blur">
        <div className="mx-auto flex max-w-xl items-center justify-between px-6 py-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-sm text-neutral-400 transition hover:text-white"
          >
            ← Dashboard
          </button>
          <span className="font-semibold tracking-tight">KYC Verification</span>
          <span className="w-20" />
        </div>
      </header>

      <main className="mx-auto max-w-xl px-6 py-8 space-y-6">
        {/* current status */}
        <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${badge.cls}`}>
          <span className={`h-2 w-2 rounded-full ${badge.dot}`} />
          KYC status: {badge.label}
        </div>

        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/40 p-7">
          <h1 className="text-lg font-semibold">Verify your documents</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Upload a government ID to complete verification.
          </p>

          {/* document type */}
          <div className="mt-6">
            <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-neutral-500">
              Document type
            </label>
            <div className="flex gap-2">
              {["AADHAAR", "PAN"].map((d) => (
                <button
                  key={d}
                  onClick={() => setDocumentType(d)}
                  className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition ${
                    documentType === d
                      ? "border-amber-400/60 bg-amber-400/10 text-amber-200"
                      : "border-neutral-700 text-neutral-300 hover:border-neutral-500"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* upload zone */}
          <div className="mt-5">
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-neutral-700 bg-neutral-950/40 px-6 py-10 transition hover:border-amber-400/50 hover:bg-neutral-900/40"
            >
              <svg
                className="h-8 w-8 text-neutral-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
              <span className="text-sm font-medium text-neutral-300">
                {file ? file.name : "Click to upload your document"}
              </span>
              <span className="text-xs text-neutral-600">JPG, PNG or PDF · max 5 MB</span>
            </button>
          </div>

          {/* simulation outcome selector (demo-only) */}
          <div className="mt-5 rounded-xl border border-neutral-800 bg-neutral-950/40 p-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-neutral-500">
              Simulated outcome (demo)
            </p>
            <div className="flex gap-2">
              {(["VALID", "PENDING", "FAILED"] as Outcome[]).map((o) => (
                <button
                  key={o}
                  onClick={() => setOutcome(o)}
                  className={`flex-1 rounded-lg border py-2 text-xs font-medium transition ${
                    outcome === o
                      ? "border-neutral-400 bg-neutral-700 text-white"
                      : "border-neutral-700 text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!file || verifyMutation.isPending}
            className="mt-6 w-full rounded-xl bg-linear-to-br from-amber-400 to-rose-500 py-3.5 font-semibold text-neutral-950 transition hover:opacity-90 active:scale-[0.99] disabled:opacity-30"
          >
            {verifyMutation.isPending ? "Verifying…" : "Submit"}
          </button>

          {errorMessage && (
            <div className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
              {errorMessage}
            </div>
          )}

          {/* result */}
          {verifyMutation.data && (
            <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-950/40 p-4 text-sm">
              <p className="font-medium">{verifyMutation.data.message}</p>
              {verifyMutation.data.extracted?.name && (
                <div className="mt-2 space-y-1 text-neutral-400">
                  <p>Name: {verifyMutation.data.extracted.name}</p>
                  <p>DOB: {verifyMutation.data.extracted.dob}</p>
                  <p>Document: {verifyMutation.data.extracted.documentNumber}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
