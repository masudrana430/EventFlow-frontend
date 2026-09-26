# EventFlow Frontend API Integration

Frontend branch: `feature/full-eventflow-frontend`

Backend base URL:

```text
https://eventflow-ln9q.onrender.com/api/v1
```

## Browser-facing API coverage

The frontend service layer in `lib/services.ts` integrates the EventFlow modules below.

| Module | Integrated capabilities |
|---|---|
| Auth | register, resend OTP, verify email, login, Google login, forgot/reset/change/set password, logout, logout-all, current user |
| User | profile update, profile-image upload |
| Organizer | apply with verification document, verify OTP, admin applications, approve/reject, organizer profile read/update |
| Admin | create admin account, users, block/unblock, audit logs, settings |
| Categories | public/admin list, create, update, delete |
| Events | public list/details, organizer list, create/update, cover/gallery, submit, publish, cancel, admin review/suspend/restore |
| Ticket types | public list, create, update, delete |
| Promos | create, list, update/disable |
| Staff | invite, accept invitation, list, assign, revoke, staff assignments |
| Orders | checkout, attendee orders, order details |
| Payments | attendee payment history, admin payment history |
| Tickets | attendee tickets, details, PDF, QR check-in, manual search/check-in |
| Refunds | request, organizer queue, admin queue, decision, completion |
| Transfers | create, accept, attendee transfer history |
| Waitlist | join, leave, attendee waitlist history |
| Notifications | list, read one, read all |
| Announcements | send, list by event |
| Reviews | create, public list, admin moderation |
| Disputes | attendee create/list, organizer queue/respond, admin queue/decision |
| Payouts | organizer request/history, admin queue/status updates |
| Analytics | attendee, organizer, staff, admin |

## Backend-owned endpoints

These are deliberately **not** called as normal UI actions:

- `GET /payment/uddoktapay/callback`
- `GET /payment/uddoktapay/cancel`
- `POST /payment/uddoktapay/webhook`

UddoktaPay invokes the callback/webhook flow. The browser only follows the checkout URL returned by `POST /orders/checkout`.

The backend verifies payment server-side and redirects the browser to the frontend order page. The frontend does not fabricate payment success.

## Role workspaces

### Attendee
- Public event discovery and checkout
- Orders/payment history
- Digital tickets and PDF download
- Refunds
- Transfers
- Waitlists
- Disputes
- Reviews
- Notifications
- Profile and security

### Organizer
- Event creation/lifecycle
- Media uploads
- Ticket inventory
- Promotions
- Staff management
- Announcements
- Refund decisions
- Dispute responses
- Payout requests/history
- Analytics and profile/payout settings

### Event Staff
- Active assignments
- QR check-in
- Manual ticket search
- Manual check-in
- Analytics

### Admin / Super Admin
- Organizer approval
- Event moderation
- Categories
- Users
- Payments
- Refund completion
- Payout processing
- Dispute decisions
- Review moderation
- Platform settings
- Audit logs
- Admin account creation
- Analytics

## Vercel + backend configuration

After the frontend is deployed, set the Render backend:

```env
FRONTEND_URL=https://YOUR-VERCEL-DOMAIN
```

The frontend should use:

```env
NEXT_PUBLIC_API_URL=https://eventflow-ln9q.onrender.com/api/v1
```

If Google login is used:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_GOOGLE_WEB_CLIENT_ID
```

Also add the deployed Vercel origin to the Google OAuth client configuration.
