# Frontend (React)

Client for the wallet & KYC application: OTP login, dashboard, wallet
management, and KYC verification.

**Stack:** React · Vite · TypeScript · TanStack Query · Tailwind CSS · Axios

---

## Features

- **OTP login / register** — single flow; new users add a name
  - OTP shown in-UI for the demo (see note below)
  - 30-second resend cooldown
  - Auto-recovery to the mobile step on lockout / expiry
- **Dashboard** — profile, wallet balance, and KYC status at a glance
- **Wallet** — add money, withdraw, and paginated passbook history
- **KYC** — document upload with selectable demo outcome (valid / pending / failed)
- Responsive layout, protected routes, JWT stored client-side

---

## Architecture Notes

- **Data layer:** plain API functions in `src/api` wrapped by TanStack Query
  hooks. Mutations (`useMutation`) handle OTP/auth/wallet actions; queries
  (`useQuery`) handle profile, balance, and KYC status, with cache invalidation
  to keep the UI in sync after transactions.
- **Auth:** the axios instance attaches the JWT automatically and redirects to
  login on 401 (auth-route 401s are excluded so OTP errors surface inline).
- **OTP demo display:** the backend returns the OTP for demonstration since real
  SMS delivery to Indian numbers requires DLT registration. In production the OTP
  would arrive via SMS and never be shown in the UI.

---

## Structure

```
src/
  api/          # axios API functions (auth, users, wallet, kyc)
  hooks/        # React Query hooks (useUser, useAuth, ...)
  pages/        # Login, Dashboard, Wallet, Kyc
  components/   # ProtectedRoute
  lib/          # axios instance + interceptors
  types/        # shared TypeScript types
```

---

## Setup

### Prerequisites

- Node.js 18+
- The backend running (locally or deployed)

### Install & configure

```bash
npm install
```

Create `.env`:

```env
VITE_API_URL=http://localhost:3000
```

For a deployed backend, point this at the live URL, e.g.
`https://transaction-backend-gbq5.onrender.com`.

### Run

```bash
npm run dev
```

App runs at `http://localhost:5173`.

### Build

```bash
npm run build      # outputs to dist/
npm run preview    # preview the production build locally
```

---

## Deployment (Netlify)

- **Build command:** `npm run build`
- **Publish directory:** `dist`
- Set `VITE_API_URL` in Netlify environment variables to the deployed backend URL
- For client-side routing, add a redirect (`public/_redirects`):

  ```
  /*  /index.html  200
  ```
