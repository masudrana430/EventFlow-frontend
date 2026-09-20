# EventFlow Frontend

Next.js + TypeScript + Tailwind starter for EventFlow.

## Current backend integration

- Attendee register + OTP verify
- Login
- Authenticated `/auth/me`
- Bearer token + cookie-ready Axios client
- Profile page
- Role-aware dashboard shell

Event/ticket/UddoktaPay/refund/check-in pages are intentionally scaffolded until those backend modules are finalized.

## Setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`.

For Render backend later:

```env
NEXT_PUBLIC_API_URL=https://YOUR-EVENTFLOW-BACKEND.onrender.com/api/v1
```

## Push to GitHub

```bash
git init
git add .
git commit -m "feat: initialize EventFlow frontend"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```
