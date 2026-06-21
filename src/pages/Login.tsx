import { useState } from "react";
import { useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { requestOtp, verifyOtp } from "../api/auth";
import { useAuth } from "../hooks/useAuth";

type Step = "mobile" | "otp";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [step, setStep] = useState<Step>("mobile");
  const [mobile, setMobile] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);

  const otpMutation = useMutation({
    mutationFn: requestOtp,
    onSuccess: (data) => {
      setIsNewUser(data.isNewUser);
      setStep("otp");
    },
  });

  const verifyMutation = useMutation({
    mutationFn: verifyOtp,
    onSuccess: (data) => {
      login(data.accessToken);
      navigate("/dashboard");
    },
  });

  const handleRequestOtp = () => {
    if (!/^[6-9]\d{9}$/.test(mobile)) return;
    otpMutation.mutate(mobile);
  };

  const handleVerify = () => {
    verifyMutation.mutate({ mobile, code, ...(isNewUser ? { name } : {}) });
  };

  const errorMessage =
    (otpMutation.error as any)?.response?.data?.message ||
    (verifyMutation.error as any)?.response?.data?.message;

  return (
    <div className="min-h-screen w-full bg-neutral-950 text-neutral-100 flex items-center justify-center p-6 relative overflow-hidden">
      {/* ambient glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-128 w-lg rounded-full bg-linear-to-br from-amber-500/20 to-rose-500/10 blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-8 backdrop-blur-xl shadow-2xl shadow-black/40">
          <h1 className="text-2xl font-semibold tracking-tight">
            {step === "mobile" ? "Sign in" : "Enter code"}
          </h1>
          <p className="mt-1.5 text-sm text-neutral-400">
            {step === "mobile"
              ? "We'll text a one-time code to verify it's you."
              : `Sent to +91 ${mobile}`}
          </p>

          {step === "mobile" && (
            <div className="mt-7 space-y-5">
              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-neutral-500">
                  Mobile number
                </label>
                <div className="flex items-center rounded-xl border border-neutral-700 bg-neutral-950/60 focus-within:border-amber-400/60 focus-within:ring-2 focus-within:ring-amber-400/15 transition">
                  <span className="pl-4 pr-2 text-sm text-neutral-500 select-none">+91</span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoFocus
                    maxLength={10}
                    placeholder="98765 43210"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    onKeyDown={(e) => e.key === "Enter" && handleRequestOtp()}
                    className="w-full bg-transparent py-3.5 pr-4 text-base tracking-wide outline-none placeholder:text-neutral-600"
                  />
                </div>
              </div>

              <button
                onClick={handleRequestOtp}
                disabled={mobile.length !== 10 || otpMutation.isPending}
                className="w-full rounded-xl bg-linear-to-br from-amber-400 to-rose-500 py-3.5 font-semibold text-neutral-950 transition hover:opacity-90 active:scale-[0.99] disabled:opacity-30 disabled:active:scale-100"
              >
                {otpMutation.isPending ? "Sending…" : "Send code"}
              </button>
            </div>
          )}

          {step === "otp" && (
            <div className="mt-7 space-y-5">
              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-neutral-500">
                  Verification code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoFocus
                  maxLength={6}
                  placeholder="••••••"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  onKeyDown={(e) => e.key === "Enter" && code.length === 6 && handleVerify()}
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-950/60 py-3.5 text-center text-2xl font-semibold tracking-[0.5em] outline-none transition focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/15 placeholder:tracking-[0.5em] placeholder:text-neutral-700"
                />
              </div>

              {isNewUser && (
                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-neutral-500">
                    Your name
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-950/60 px-4 py-3.5 outline-none transition focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/15 placeholder:text-neutral-600"
                  />
                </div>
              )}

              <button
                onClick={handleVerify}
                disabled={
                  code.length !== 6 ||
                  (isNewUser && name.trim().length < 2) ||
                  verifyMutation.isPending
                }
                className="w-full rounded-xl bg-linear-to-br from-amber-400 to-rose-500 py-3.5 font-semibold text-neutral-950 transition hover:opacity-90 active:scale-[0.99] disabled:opacity-30 disabled:active:scale-100"
              >
                {verifyMutation.isPending ? "Verifying…" : "Verify & continue"}
              </button>

              <button
                onClick={() => {
                  setStep("mobile");
                  setCode("");
                  setName("");
                }}
                className="w-full text-sm text-neutral-500 transition hover:text-neutral-300"
              >
                ← Use a different number
              </button>
            </div>
          )}

          {errorMessage && (
            <div className="mt-5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
              {errorMessage}
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-neutral-600">Protected by OTP verification</p>
      </div>
    </div>
  );
}
