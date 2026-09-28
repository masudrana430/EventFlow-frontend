# EventFlow Frontend

Role-aware Next.js frontend for **EventFlow**, an event-management and ticketing platform covering public event discovery, attendee checkout, organizer operations, staff check-in, admin moderation, payments, digital tickets, announcements, refunds, payouts, and analytics.

Production frontend:

https://event-flow-frontend-nu.vercel.app

Production API:

https://eventflow-ln9q.onrender.com/api/v1

Swagger:

https://eventflow-ln9q.onrender.com/api-docs

Backend repository:

https://github.com/masudrana430/EventFlow

---

## Technology stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 15 App Router |
| UI runtime | React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS |
| HTTP client | Axios |
| Icons | Lucide React |
| Hosting | Vercel |

The frontend deliberately keeps business-critical authorization and money/ticket decisions on the backend. The UI is role-aware, but backend RBAC remains authoritative.

---

# Product overview

EventFlow has five roles:

| Role | Frontend experience |
| --- | --- |
| Guest | Browse public events, sign in, register, apply as organizer |
| Attendee | Buy tickets, view orders, download tickets, manage attendee tools |
| Organizer | Create/manage events, ticket types, promos, staff, announcements, payouts |
| Event Staff | View assigned events and perform check-in |
| Admin | Review organizer/event queues, users, finance, disputes, categories |
| Super Admin | Admin capabilities plus platform-level administration |

The same frontend application renders different dashboards and navigation based on the authenticated user's role.

---

# Route map

## Public and authentication routes

| Route | Purpose |
| --- | --- |
| / | Landing page |
| /events | Public event discovery |
| /events/[id] | Public event detail + ticket selection |
| /login | Shared sign-in |
| /register | Attendee registration |
| /verify-email | Attendee OTP verification |
| /forgot-password | Request password-reset OTP |
| /reset-password | Verify OTP + set new password |
| /apply-organizer | Organizer application |
| /staff/accept | Staff invitation acceptance |

## Shared dashboard routes

| Route | Purpose |
| --- | --- |
| /dashboard | Role-aware home dashboard |
| /dashboard/notifications | In-app notifications |
| /dashboard/security | Password/session security |
| /profile | User profile |

## Attendee routes

| Route | Purpose |
| --- | --- |
| /dashboard/orders | Order history |
| /dashboard/orders/[id] | Order details/payment return |
| /dashboard/tickets | Digital tickets + PDF download |
| /dashboard/attendee | Attendee tools |

## Organizer routes

| Route | Purpose |
| --- | --- |
| /dashboard/events | Organizer's events |
| /dashboard/events/new | Create new event |
| /dashboard/events/[id]/manage | Manage event, tickets, promos, announcements, payout |
| /dashboard/staff | Invite/assign/revoke staff |
| /dashboard/finance | Finance/payout/refund views where role permits |

## Event Staff routes

| Route | Purpose |
| --- | --- |
| /dashboard/check-in | Assigned-event QR/manual check-in |

## Admin / Super Admin routes

| Route | Purpose |
| --- | --- |
| /dashboard/admin | Platform moderation/administration |
| /dashboard/finance | Payments/refunds/payout/dispute operations |

---

# Frontend architecture

~~~mermaid
flowchart TD
    P[Public pages] --> API[Axios API layer]
    A[Auth pages] --> API
    D[Role-aware dashboard] --> API
    API --> AUTH[Local session + backend cookies/tokens]
    API --> B[EventFlow Backend]
    B --> PAY[Paymently / Stripe / BDT gateways]
    B --> DB[(PostgreSQL)]
    B --> MAIL[Resend]
    B --> REDIS[Redis]
~~~

Important rule:

> The frontend may hide or show controls by role, but it does not decide authorization. The backend validates role, ownership, event state, ticket state, payment status, and check-in eligibility.

---

# Complete user mechanism

## 1. Guest experience

A visitor can:

- open the landing page
- browse published events
- open an event detail page
- inspect ticket types, remaining inventory, date, venue, currency, and pricing
- register as an Attendee
- sign in
- start an Organizer application

Guests cannot purchase until authenticated as an Attendee.

## 2. Attendee registration

The attendee flow is:

~~~text
Register
  -> submit name/email/password
  -> backend sends OTP
  -> open Verify Email
  -> submit OTP
  -> account created
  -> session saved
  -> dashboard
~~~

Direct registration always creates an **ATTENDEE** role.

Google login is also Attendee-only.

## 3. Sign-in

All password-based roles use the shared **/login** page.

After successful login, the frontend stores the access session and routes according to account state.

Special case:

~~~text
mustChangePassword = true
  -> /dashboard/security
~~~

This is used for temporary-password flows such as Event Staff.

## 4. Organizer application

A new Organizer applicant uses:

~~~text
/apply-organizer
~~~

The applicant provides identity/organization information plus a verification document.

Flow:

~~~text
Application form
  -> upload verification document
  -> OTP email
  -> verify application email
  -> application becomes pending
  -> Admin reviews
  -> approved organizer can sign in
~~~

### Current account limitation

The current backend has a single primary role per user. An email already registered as ATTENDEE cannot currently apply again as a new ORGANIZER account using the same email.

The current practical approach is a separate organizer email/account.

## 5. Organizer creates an event

After organizer approval:

~~~text
Dashboard
  -> My events
  -> Create event
~~~

The create-event form includes:

- category
- capacity
- BDT or USD
- title
- descriptions
- venue
- start/end
- entry opening
- ticket-sale start/end
- contact data
- policies/refund fields where configured

The event is created as a **draft**.

## 6. Organizer completes event setup

On the event management page the Organizer can:

- upload cover image
- upload gallery images
- create ticket types
- update permitted event details
- create promo codes
- send announcements
- request payout when eligible

Before review the event needs at least:

- a cover image
- one ticket type

## 7. Event review and publish

Organizer submits the event for Admin review.

~~~text
DRAFT
  -> PENDING_REVIEW
  -> APPROVED / REJECTED / CHANGES_REQUESTED
  -> PUBLISHED
~~~

Only a published event appears to attendees as purchasable.

## 8. BDT / USD event behavior

The organizer chooses event currency during creation:

~~~text
BDT
USD
~~~

The frontend uses that currency for:

- public ticket prices
- organizer ticket price labels
- order totals
- payment views
- refunds/payouts
- analytics displays

Currency becomes locked after ticket inventory exists.

### Paymently alignment

The frontend sends checkout to EventFlow. The backend then creates the Paymently invoice.

For correct gateway display:

| Event | Paymently default currency | Backend UDDOKTAPAY_CURRENCY | Typical gateway |
| --- | --- | --- | --- |
| BDT | BDT | BDT | bKash / BDT |
| USD | USD | USD | Stripe |

The frontend does not directly choose Stripe or bKash. Paymently exposes gateways compatible with its configured transaction currency.

## 9. Attendee ticket purchase

On an event detail page:

1. attendee selects a ticket type
2. selects quantity
3. optionally enters promo code
4. clicks Continue to checkout
5. frontend calls backend checkout API
6. backend reserves inventory and creates pending order
7. frontend receives payment URL
8. browser redirects to Paymently

For free tickets, the backend can finalize immediately without an external payment page.

## 10. Stripe sandbox test flow

For a USD test event:

~~~text
USD event
  -> USD ticket
  -> checkout
  -> Paymently USD
  -> Stripe Sandbox
  -> test card
  -> Paymently returns to backend
  -> backend verifies invoice
  -> backend redirects to order detail
~~~

A successful Stripe page alone is not enough. The frontend shows success only after the backend verifies and finalizes the order.

## 11. Payment return

Paymently returns to a backend callback.

After server-side verification, backend redirects the browser to:

~~~text
/dashboard/orders/{orderId}?payment=success
~~~

The order-details page displays the finalized order state.

Expected successful result:

~~~text
Order: PAID
Payment: PAID
Tickets generated
~~~

## 12. Promo display

The frontend accepts a promo code during checkout.

The backend remains responsible for:

- validity
- time range
- usage count
- minimum order
- attendee reuse rules
- final discount value

The frontend simply renders the returned order amounts/currency.

## 13. Digital tickets

After successful checkout, Attendees open:

~~~text
/dashboard/tickets
~~~

Each ticket card shows:

- event
- ticket type
- original ticket value
- currency
- status
- event date
- signed QR payload
- PDF download

Status can include:

~~~text
VALID
CHECKED_IN
...
~~~

The PDF is generated by the backend, not rendered locally in the browser.

## 14. Premium PDF ticket

Clicking **Download PDF** calls the backend ticket endpoint.

The backend-generated PDF contains:

- branded EventFlow header
- ticket status badge
- event title
- price/currency
- ticket type
- ticket number
- order number
- venue/address
- date/time
- framed QR code
- ticket security guidance

This means an existing ticket automatically gets the latest PDF design when downloaded again.

## 15. Event Staff invitation

Organizer opens:

~~~text
/dashboard/staff
~~~

and invites staff by email, assigning one or more events.

The email includes:

- invitation token
- temporary password
- 48-hour expiry
- Accept Staff Invitation button

Acceptance URL:

https://event-flow-frontend-nu.vercel.app/staff/accept

Staff flow:

~~~text
Email
  -> Accept Staff Invitation
  -> paste token
  -> invitation accepted
  -> go to /login
  -> sign in with invited email + temporary password
  -> redirected to Security if mustChangePassword
  -> choose permanent password
  -> staff dashboard
~~~

## 16. Event Staff dashboard

Event Staff sees only staff-appropriate tools.

Typical navigation:

- Overview
- Notifications
- Security
- Check-in
- Profile

The frontend intentionally does not expose organizer finance/event-editing controls to Event Staff.

## 17. Staff check-in

The check-in page loads staff assignments.

Staff chooses the active event, then can use:

### QR check-in

Current frontend flow accepts the **signed QR payload text** from the attendee's digital ticket.

~~~text
Select event
  -> paste QR payload
  -> Check in ticket
  -> backend validates
~~~

The backend validates event assignment, QR signature, ticket status, and entry window.

On success:

~~~text
VALID -> CHECKED_IN
~~~

Trying the same ticket again is rejected.

### Entry window

If staff tries too early, the UI surfaces the backend error:

~~~text
Event entry window is not open
~~~

That is expected behavior.

### Manual search

Staff can search by attendee/ticket identifiers and manually confirm entry as a fallback.

A future UX improvement is direct camera QR scanning. The current implementation uses payload entry/manual search.

## 18. Announcement mechanism

On the organizer event-management page:

~~~text
Send announcement
~~~

Organizer provides:

- title
- message

The backend determines recipients.

Eligible distinct ticket owners with tickets in **VALID** or **CHECKED_IN** state receive:

1. in-app notification
2. email

The frontend does not loop over attendees or send mail itself.

## 19. Notifications

Users can open:

~~~text
/dashboard/notifications
~~~

The role-aware dashboard also shows recent notifications.

Examples include:

- organizer application decision
- event lifecycle updates
- purchase/payment
- announcements
- waitlist offer
- refunds
- disputes
- payout status

## 20. Refunds

Attendee refund tools submit requests to the backend.

The UI displays backend-controlled status and eligibility. The frontend never calculates authoritative refund eligibility by itself.

Organizer/Admin views expose appropriate review/completion actions according to backend RBAC.

## 21. Ticket transfers

Eligible attendee tickets can enter a transfer workflow.

The frontend collects recipient details and displays transfer state, while the backend validates:

- transferability
- ticket status
- event state
- expiry
- ownership

## 22. Waitlist

When relevant inventory is unavailable, an attendee can join the waitlist.

The frontend displays waitlist state/offers. Background allocation is controlled by the backend.

## 23. Reviews

Eligible attendees can review completed events.

The backend determines review eligibility and admin moderation rights.

## 24. Disputes

Attendees can open commerce/event-related disputes.

Organizer/Admin interfaces expose the corresponding response/decision actions based on role.

## 25. Organizer payouts and finance

Organizer finance views show backend-calculated monetary data.

Payout requests become valid only after backend eligibility checks such as:

- completed event
- hold period passed
- no blocking dispute

## 26. Role-aware dashboard

The main dashboard dynamically changes quick actions and analytics.

### Attendee

Typical quick actions:

- Browse events
- My orders
- My tickets

### Organizer

Typical quick actions:

- Create event
- Manage events
- Manage staff

### Event Staff

Typical quick actions:

- Open check-in
- My assignments

### Admin / Super Admin

Typical quick actions:

- Admin center
- Platform users
- Finance queues

The frontend requests analytics from the endpoint appropriate to the user's role.

## 27. BDT/USD analytics

Currency-aware analytics are rendered separately.

Examples:

~~~text
Gross Ticket Revenue BDT: ৳...
Gross Ticket Revenue USD: $...
~~~

The frontend does not combine BDT and USD into one meaningless total.

---

# Authentication/session implementation

The frontend currently keeps:

~~~text
eventflow_access_token
eventflow_user
~~~

in browser localStorage for client-side API/session behavior, while the backend also issues secure authentication cookies.

Axios sends API requests to the configured backend.

The backend remains responsible for token/session validity.

### Password security page

At:

~~~text
/dashboard/security
~~~

users can:

- change current password
- satisfy forced temporary-password change
- set password for eligible Google attendee accounts
- log out all sessions

---

# API client behavior

The frontend communicates only with the backend API.

Typical patterns:

~~~text
Public page
  -> GET public events

Attendee checkout
  -> POST order checkout
  -> redirect to returned payment URL

Ticket page
  -> GET my tickets
  -> GET PDF blob

Organizer event manager
  -> event/ticket/promo/announcement/payout APIs

Staff check-in
  -> assignments
  -> QR/manual check-in APIs

Admin
  -> moderation/finance/platform APIs
~~~

Errors are normalized into user-facing alerts.

---

# Local setup

## Install

~~~bash
npm install
cp .env.example .env.local
npm run dev
~~~

Open:

~~~text
http://localhost:3000
~~~

## Environment

~~~env
NEXT_PUBLIC_API_URL=https://eventflow-ln9q.onrender.com/api/v1
NEXT_PUBLIC_APP_NAME=EventFlow
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
~~~

For local backend development:

~~~env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
~~~

---

# Scripts

| Command | Purpose |
| --- | --- |
| npm run dev | Start Next.js development server |
| npm run build | Production build |
| npm start | Start built Next.js app |

---

# Vercel deployment

1. Import the repository into Vercel.
2. Framework preset: **Next.js**.
3. Add required public environment values.
4. Deploy.
5. Configure backend **FRONTEND_URL** to the final Vercel URL.
6. Redeploy backend so CORS, cookies, CSRF trusted-origin checks, and payment redirects use the correct frontend.

Current production frontend:

https://event-flow-frontend-nu.vercel.app

---

# Backend dependency

The frontend requires the EventFlow backend for all authoritative workflows.

Backend repository:

https://github.com/masudrana430/EventFlow

Production backend:

https://eventflow-ln9q.onrender.com

Swagger:

https://eventflow-ln9q.onrender.com/api-docs

Backend responsibilities include:

- role authorization
- event ownership
- organizer approval
- inventory reservation
- promo validation
- payment verification
- order finalization
- ticket generation
- QR integrity
- check-in
- refunds
- transfers
- waitlists
- announcements
- disputes
- payouts
- analytics
- notifications

---

# Security rules for frontend contributors

Do not:

- hard-code production secrets
- trust URL query parameters as proof of payment
- mark an order paid from the browser
- generate authoritative tickets client-side
- bypass role checks because a button is hidden
- expose QR_SECRET, JWT secrets, Paymently API keys, Resend keys, Cloudinary secrets, or database credentials

Do:

- use the backend API as the source of truth
- display structured backend errors
- preserve currency information returned by the backend
- keep role-specific navigation scoped
- require backend confirmation after all sensitive actions

---

# Current implementation notes

1. **Staff QR check-in currently accepts signed QR payload text rather than direct camera scanning.**
2. **Existing Attendee email cannot currently become Organizer using the same account/email because the backend stores one primary role.**
3. **Paymently default currency and backend UDDOKTAPAY_CURRENCY must match for paid checkout.**
4. **Stripe development should use Sandbox/Test Mode.**
5. **Ticket PDF rendering is backend-generated, so PDF redesigns do not require regenerating ticket database records.**

---

# End-to-end summary

~~~mermaid
flowchart TD
    G[Guest] --> R[Register Attendee]
    G --> OA[Organizer Application]

    R --> B[Browse Published Event]
    B --> C[Choose Ticket]
    C --> O[Create Reservation + Order]
    O --> P[Paymently Checkout]
    P --> V[Backend Verify Payment]
    V --> T[Generate QR Ticket]
    T --> PDF[View / Download Ticket]
    PDF --> CI[Staff Check-in]

    OA --> AR[Admin Review]
    AR -->|Approved| OE[Organizer Creates Event]
    OE --> ER[Admin Event Review]
    ER -->|Approved| PUB[Publish]
    PUB --> B

    OE --> SI[Invite Event Staff]
    SI --> SA[Accept Invitation]
    SA --> SL[Staff Login]
    SL --> CI

    OE --> ANN[Send Announcement]
    ANN --> N[Email + In-app Notification]

    PUB --> FIN[Event Completion]
    FIN --> PAYOUT[Payout Eligibility]
~~~

This repository is the user-facing layer of EventFlow. The backend repository contains the authoritative domain logic.
