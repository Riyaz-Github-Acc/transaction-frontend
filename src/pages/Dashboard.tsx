import { useNavigate } from "react-router";
import { useUser } from "../hooks/useUser";
import { useAuth } from "../hooks/useAuth";

export default function Dashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { data: user, isLoading, isError } = useUser();

  const initial = user?.name?.trim()?.[0]?.toUpperCase() ?? "U";
  const balance = Number(user?.wallet?.balance ?? 0);

  return (
    <div className="min-h-screen w-full bg-neutral-950 text-neutral-100">
      {/* top bar */}
      <header className="border-b border-neutral-800 bg-neutral-900/40 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-linear-to-br from-amber-400 to-rose-500 font-bold text-neutral-950">
              ₹
            </div>
            <span className="font-semibold tracking-tight">PayLite</span>
          </div>
          <button
            onClick={logout}
            className="rounded-lg border border-neutral-700 px-3 py-1.5 text-sm text-neutral-300 transition hover:border-neutral-500 hover:text-white"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">
        {isLoading && (
          <div className="space-y-4">
            <div className="h-40 animate-pulse rounded-3xl bg-neutral-900" />
            <div className="h-28 animate-pulse rounded-3xl bg-neutral-900" />
          </div>
        )}

        {isError && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            Couldn't load your details. Please try again.
          </div>
        )}

        {user && (
          <div className="space-y-6">
            {/* wallet balance card */}
            <section className="relative overflow-hidden rounded-3xl border border-neutral-800 bg-linear-to-br from-neutral-900 to-neutral-900/40 p-7">
              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-linear-to-br from-amber-500/20 to-rose-500/10 blur-2xl" />
              <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                Wallet balance
              </p>
              <p className="mt-2 text-4xl font-semibold tracking-tight">
                ₹{balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => navigate("/wallet")}
                  className="rounded-xl bg-linear-to-br from-amber-400 to-rose-500 px-5 py-2.5 text-sm font-semibold text-neutral-950 transition hover:opacity-90 active:scale-[0.99]"
                >
                  Manage wallet →
                </button>
                <button
                  onClick={() => navigate("/wallet?tab=passbook")}
                  className="rounded-xl border border-neutral-700 px-5 py-2.5 text-sm font-medium text-neutral-200 transition hover:border-neutral-500 hover:text-white active:scale-[0.99]"
                >
                  View passbook
                </button>
              </div>
            </section>

            {/* profile card */}
            <section className="rounded-3xl border border-neutral-800 bg-neutral-900/40 p-7">
              <div className="flex items-center gap-4">
                <div className="grid h-14 w-14 place-items-center rounded-full bg-neutral-800 text-xl font-semibold text-amber-300">
                  {initial}
                </div>
                <div>
                  <p className="text-lg font-semibold">{user.name ?? "Unnamed user"}</p>
                  <p className="text-sm text-neutral-400">+91 {user.mobile}</p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <Detail label="Account status">
                  <span className={user.isVerified ? "text-emerald-400" : "text-amber-400"}>
                    {user.isVerified ? "Verified" : "Pending"}
                  </span>
                </Detail>
                <Detail label="Member since">
                  {new Date(user.memberSince).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </Detail>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 px-4 py-3">
      <p className="text-xs uppercase tracking-wider text-neutral-500">{label}</p>
      <p className="mt-1 font-medium">{children}</p>
    </div>
  );
}
