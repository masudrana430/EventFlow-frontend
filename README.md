# EventFlow Frontend

Full Next.js + TypeScript frontend for the EventFlow backend.

## Stack

- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS
- Axios
- Lucide icons

## Backend

Production API:

```text
https://eventflow-ln9q.onrender.com/api/v1
```

Swagger:

```text
https://eventflow-ln9q.onrender.com/api-docs
```

## Features

### Public
- Landing page
- Event discovery/search/filter
- Event details, ticket inventory and checkout
- Attendee registration + OTP verification
- Login + optional Google Identity sign-in
- Forgot/reset password
- Organizer application + verification document + OTP
- Event staff invitation acceptance

### Attendee
- Role-aware dashboard and analytics
- Orders and payment history
- Payment return handling
- Digital ticket list and PDF download
- Ticket transfers
- Refund requests
- Waitlists
- Disputes
- Completed-event reviews
- Notifications
- Profile image and profile updates
- Password/session security

### Organizer
- Organizer dashboard/analytics
- Event creation and event lifecycle
- Cover and gallery uploads
- Ticket type inventory
- Promo codes
- Event announcements
- Staff invitations/assignments/revocation
- Refund review
- Payout requests/history
- Organizer profile

### Event Staff
- Assignment-aware check-in workspace
- QR payload validation
- Manual attendee/ticket search
- Manual check-in
- Staff analytics

### Admin / Super Admin
- Organizer application approval/rejection
- Event review / changes requested / rejection
- Event suspension and restore
- User status management
- Categories
- Platform payments
- Refund completion
- Payout processing
- Dispute decisions
- Platform settings
- Admin account creation
- Review moderation
- Audit logs
- Admin analytics

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

`.env.local`:

```env
NEXT_PUBLIC_API_URL=https://eventflow-ln9q.onrender.com/api/v1
NEXT_PUBLIC_APP_NAME=EventFlow
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
```

Open:

```text
http://localhost:3000
```

## Vercel deployment

1. Import `masudrana430/EventFlow-frontend` into Vercel.
2. Framework preset: **Next.js**.
3. Add:
   ```env
   NEXT_PUBLIC_API_URL=https://eventflow-ln9q.onrender.com/api/v1
   NEXT_PUBLIC_APP_NAME=EventFlow
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-web-client-id
   ```
4. Deploy.
5. Copy the final Vercel URL.
6. Update the EventFlow backend Render environment:
   ```env
   FRONTEND_URL=https://your-eventflow-frontend.vercel.app
   ```
7. Redeploy the backend so CORS, CSRF trusted origin and UddoktaPay browser redirects use the Vercel frontend.

## Payment flow

The frontend calls `POST /orders/checkout`. For a paid order, the API returns an UddoktaPay `paymentUrl`; the browser is redirected there. UddoktaPay returns to the backend callback. The backend verifies the invoice server-side and then redirects to:

```text
/dashboard/orders/{orderId}?payment=success
```

The frontend never treats a browser redirect as proof of payment.

## Security

The frontend uses a Bearer access token for API calls. The backend remains the source of truth for:
- RBAC
- event ownership
- organizer approval
- payment verification
- ticket validity
- refund/dispute/payout eligibility
- QR check-in validation

Do not commit API secrets, UddoktaPay credentials, Resend API keys, database credentials or JWT secrets into this repository.
