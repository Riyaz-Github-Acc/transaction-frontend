import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addMoney, withdraw, getPassbook } from "../api/wallet";
import { useUser } from "../hooks/useUser";

type Tab = "manage" | "passbook";

export default function Wallet() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  const initialTab: Tab = searchParams.get("tab") === "passbook" ? "passbook" : "manage";
  const [tab, setTab] = useState<Tab>(initialTab);
  const [amount, setAmount] = useState("");

  const { data: user } = useUser();
  const balance = Number(user?.wallet?.balance ?? 0);

  // refresh both balance (me) and passbook after any transaction
  const onTxnSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["me"] });
    queryClient.invalidateQueries({ queryKey: ["passbook"] });
    setAmount("");
  };

  const addMutation = useMutation({ mutationFn: addMoney, onSuccess: onTxnSuccess });
  const withdrawMutation = useMutation({ mutationFn: withdraw, onSuccess: onTxnSuccess });

  const passbookQuery = useQuery({
    queryKey: ["passbook"],
    queryFn: () => getPassbook(1, 50),
  });

  const numericAmount = Number(amount);
  const isValidAmount = numericAmount > 0 && numericAmount <= 1000000;

  const txnError =
    (addMutation.error as any)?.response?.data?.message ||
    (withdrawMutation.error as any)?.response?.data?.message;

  return (
    <div className="min-h-screen w-full bg-neutral-950 text-neutral-100">
      {/* top bar */}
      <header className="border-b border-neutral-800 bg-neutral-900/40 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
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

      <main className="mx-auto max-w-3xl px-6 py-8 space-y-6">
        {/* balance */}
        <section className="rounded-3xl border border-neutral-800 bg-linear-to-br from-neutral-900 to-neutral-900/40 p-7">
          <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
            Available balance
          </p>
          <p className="mt-2 text-4xl font-semibold tracking-tight">
            ₹{balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </p>
        </section>

        {/* tabs */}
        <div className="flex gap-1 rounded-xl border border-neutral-800 bg-neutral-900/40 p-1">
          <TabButton active={tab === "manage"} onClick={() => setTab("manage")}>
            Add / Withdraw
          </TabButton>
          <TabButton active={tab === "passbook"} onClick={() => setTab("passbook")}>
            Passbook
          </TabButton>
        </div>

        {tab === "manage" && (
          <section className="rounded-3xl border border-neutral-800 bg-neutral-900/40 p-7">
            <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-neutral-500">
              Amount
            </label>
            <div className="flex items-center rounded-xl border border-neutral-700 bg-neutral-950/60 focus-within:border-amber-400/60 focus-within:ring-2 focus-within:ring-amber-400/15 transition">
              <span className="pl-4 pr-1 text-lg text-neutral-500">₹</span>
              <input
                type="number"
                inputMode="decimal"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-transparent py-3.5 pr-4 text-lg outline-none placeholder:text-neutral-600"
              />
            </div>

            {/* quick amounts */}
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

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => addMutation.mutate(numericAmount)}
                disabled={!isValidAmount || addMutation.isPending}
                className="rounded-xl bg-linear-to-br from-emerald-400 to-teal-500 py-3.5 font-semibold text-neutral-950 transition hover:opacity-90 active:scale-[0.99] disabled:opacity-30"
              >
                {addMutation.isPending ? "Adding…" : "Add money"}
              </button>
              <button
                onClick={() => withdrawMutation.mutate(numericAmount)}
                disabled={!isValidAmount || numericAmount > balance || withdrawMutation.isPending}
                className="rounded-xl border border-neutral-700 py-3.5 font-semibold text-neutral-100 transition hover:border-neutral-500 active:scale-[0.99] disabled:opacity-30"
              >
                {withdrawMutation.isPending ? "Withdrawing…" : "Withdraw"}
              </button>
            </div>

            {numericAmount > balance && amount !== "" && (
              <p className="mt-3 text-xs text-amber-400">
                Amount exceeds your available balance for withdrawal.
              </p>
            )}

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
