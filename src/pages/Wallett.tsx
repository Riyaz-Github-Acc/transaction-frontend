import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addMoney, withdraw, getPassbook } from "../api/wallet";
import { useUser } from "../hooks/useUser";
import toast from "react-hot-toast";

type Tab = "manage" | "passbook";
type Action = "add" | "withdraw" | null;

export default function Wallet() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  const initialTab: Tab = searchParams.get("tab") === "passbook" ? "passbook" : "manage";
  const [tab, setTab] = useState<Tab>(initialTab);
  const [action, setAction] = useState<Action>(null);
  const [amount, setAmount] = useState("");

  const { data: user } = useUser();
  const balance = Number(user?.wallet?.balance ?? 0);

  const onTxnSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["me"] });
    queryClient.invalidateQueries({ queryKey: ["passbook"] });
    setAmount("");
    setAction(null);
  };

  const addMutation = useMutation({
    mutationFn: addMoney,
    onSuccess: (_data, amount) => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      queryClient.invalidateQueries({ queryKey: ["passbook"] });
      toast.success(`₹${Number(amount).toLocaleString("en-IN")} added to your wallet`);
      setAmount("");
      setAction(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? "Failed to add money");
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: withdraw,
    onSuccess: (_data, amount) => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      queryClient.invalidateQueries({ queryKey: ["passbook"] });
      toast.success(`₹${Number(amount).toLocaleString("en-IN")} withdrawn from your wallet`);
      setAmount("");
      setAction(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? "Withdrawal failed");
    },
  });

  const passbookQuery = useQuery({
    queryKey: ["passbook"],
    queryFn: () => getPassbook(1, 50),
  });

  const numericAmount = Number(amount);
  const isValidAmount = numericAmount > 0 && numericAmount <= 1000000;
  const isWithdraw = action === "withdraw";
  const exceedsBalance = isWithdraw && numericAmount > balance;

  const activeMutation = isWithdraw ? withdrawMutation : addMutation;
  const txnError = (activeMutation.error as any)?.response?.data?.message;

  const handleSubmit = () => {
    if (!isValidAmount || exceedsBalance) return;
    activeMutation.mutate(numericAmount);
  };

  const resetAction = () => {
    setAction(null);
    setAmount("");
    addMutation.reset();
    withdrawMutation.reset();
  };

  return (
    <div className="min-h-screen w-full bg-neutral-950 text-neutral-100">
      <header className="border-b border-neutral-800 bg-neutral-900/40 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-sm text-neutral-400 transition hover:text-white"
          >
            ← Dashboard
          </button>
          <span className="font-semibold tracking-tight">Wallet</span>
          <span className="w-20" />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8 space-y-4 sm:space-y-6">
        {/* balance */}
        <section className="rounded-3xl border border-neutral-800 bg-linear-to-br from-neutral-900 to-neutral-900/40 p-5 sm:p-7">
          <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
            Available balance
          </p>
          <p className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight">
            ₹{balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </p>
        </section>

        {/* tabs */}
        <div className="flex gap-1 rounded-xl border border-neutral-800 bg-neutral-900/40 p-1">
          <TabButton
            active={tab === "manage"}
            onClick={() => {
              setTab("manage");
              resetAction();
            }}
          >
            Add / Withdraw
          </TabButton>
          <TabButton active={tab === "passbook"} onClick={() => setTab("passbook")}>
            Passbook
          </TabButton>
        </div>

        {tab === "manage" && action === null && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => setAction("add")}
              className="group rounded-3xl border border-neutral-800 bg-neutral-900/40 p-6 text-left transition hover:border-emerald-500/40"
            >
              <div className="grid h-11 w-11 place-items-center rounded-full bg-emerald-500/15 text-xl font-bold text-emerald-400">
                +
              </div>
              <p className="mt-4 text-lg font-semibold">Add money</p>
              <p className="mt-0.5 text-sm text-neutral-500">Top up your wallet balance</p>
            </button>

            <button
              onClick={() => setAction("withdraw")}
              className="group rounded-3xl border border-neutral-800 bg-neutral-900/40 p-6 text-left transition hover:border-rose-500/40"
            >
              <div className="grid h-11 w-11 place-items-center rounded-full bg-rose-500/15 text-xl font-bold text-rose-400">
                −
              </div>
              <p className="mt-4 text-lg font-semibold">Withdraw</p>
              <p className="mt-0.5 text-sm text-neutral-500">Transfer money out of your wallet</p>
            </button>
          </div>
        )}

        {tab === "manage" && action !== null && (
          <section className="rounded-3xl border border-neutral-800 bg-neutral-900/40 p-5 sm:p-7">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {isWithdraw ? "Withdraw money" : "Add money"}
              </h2>
              <button
                onClick={resetAction}
                className="text-sm text-neutral-500 transition hover:text-neutral-300"
              >
                ← Back
              </button>
            </div>

            <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-neutral-500">
              Amount
            </label>
            <div className="flex items-center rounded-xl border border-neutral-700 bg-neutral-950/60 focus-within:border-amber-400/60 focus-within:ring-2 focus-within:ring-amber-400/15 transition">
              <span className="pl-4 pr-1 text-lg text-neutral-500">₹</span>
              <input
                type="number"
                inputMode="decimal"
                autoFocus
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className="w-full bg-transparent py-3.5 pr-4 text-lg outline-none placeholder:text-neutral-600"
              />
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {[100, 500, 1000, 2000].map((v) => (
                <button
                  key={v}
                  onClick={() => setAmount(String(v))}
                  className="rounded-lg border border-neutral-700 px-3 py-1.5 text-sm text-neutral-300 transition hover:border-neutral-500 hover:text-white"
                >
                  ₹{v}
                </button>
              ))}
            </div>

            {exceedsBalance && amount !== "" && (
              <p className="mt-3 text-xs text-amber-400">Amount exceeds your available balance.</p>
            )}

            <button
              onClick={handleSubmit}
              disabled={!isValidAmount || exceedsBalance || activeMutation.isPending}
              className={`mt-6 w-full rounded-xl py-3.5 font-semibold text-neutral-950 transition hover:opacity-90 active:scale-[0.99] disabled:opacity-30 ${
                isWithdraw
                  ? "bg-linear-to-br from-rose-400 to-orange-500"
                  : "bg-linear-to-br from-emerald-400 to-teal-500"
              }`}
            >
              {activeMutation.isPending
                ? isWithdraw
                  ? "Withdrawing…"
                  : "Adding…"
                : isWithdraw
                  ? "Withdraw"
                  : "Add money"}
            </button>

            {txnError && (
              <div className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                {txnError}
              </div>
            )}
          </section>
        )}

        {tab === "passbook" && (
          <section className="rounded-3xl border border-neutral-800 bg-neutral-900/40 p-2 sm:p-4">
            {passbookQuery.isLoading && (
              <div className="space-y-2 p-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-14 animate-pulse rounded-xl bg-neutral-800/60" />
                ))}
              </div>
            )}

            {passbookQuery.data?.transactions.length === 0 && (
              <p className="px-4 py-10 text-center text-sm text-neutral-500">
                No transactions yet. Add money to get started.
              </p>
            )}

            <ul className="divide-y divide-neutral-800">
              {passbookQuery.data?.transactions.map((txn) => {
                const credit = txn.type === "CREDIT";
                return (
                  <li key={txn.id} className="flex items-center justify-between px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className={`grid h-9 w-9 place-items-center rounded-full text-sm font-bold ${
                          credit
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-rose-500/15 text-rose-400"
                        }`}
                      >
                        {credit ? "+" : "−"}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {credit ? "Money added" : "Withdrawal"}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {new Date(txn.createdAt).toLocaleString("en-IN", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-semibold ${
                          credit ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {credit ? "+" : "−"}₹
                        {Number(txn.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-neutral-500">
                        Bal: ₹
                        {Number(txn.balanceAfter).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition ${
        active ? "bg-neutral-800 text-white" : "text-neutral-400 hover:text-neutral-200"
      }`}
    >
      {children}
    </button>
  );
}
