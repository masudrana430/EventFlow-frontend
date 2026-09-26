import { api } from "@/lib/api";
import type { ApiResponse, AnyRecord, AuthUser, Category, EventItem, TicketType } from "@/types";

const unwrap = <T>(response: { data: ApiResponse<T> }) => response.data;

export const authApi = {
  resendOtp: (email: string) => api.post("/auth/resend-verification-otp", { email }).then(unwrap),
  google: (idToken: string) => api.post("/auth/google", { idToken }).then(unwrap),
  forgotPassword: (email: string) => api.post("/auth/forgot-password", { email }).then(unwrap),
  resetPassword: (payload: { email: string; otp: string; newPassword: string }) =>
    api.post("/auth/reset-password", payload).then(unwrap),
  changePassword: (payload: { currentPassword: string; newPassword: string }) =>
    api.post("/auth/change-password", payload).then(unwrap),
  setPassword: (newPassword: string) => api.post("/auth/set-password", { newPassword }).then(unwrap),
  logoutAll: () => api.post("/auth/logout-all").then(unwrap),
};

export const profileApi = {
  update: (payload: AnyRecord) => api.patch<ApiResponse<AuthUser>>("/user/profile", payload).then(unwrap),
  uploadImage: (file: File) => {
    const form = new FormData();
    form.append("profileImage", file);
    return api.patch("/user/profile-image", form).then(unwrap);
  },
};

export const organizerApi = {
  apply: (payload: AnyRecord, verificationDocument: File) => {
    const form = new FormData();
    form.append("data", JSON.stringify(payload));
    form.append("verificationDocument", verificationDocument);
    return api.post("/organizer/apply", form).then(unwrap);
  },
  verify: (email: string, otp: string) =>
    api.post("/organizer/verify-email", { email, otp }).then(unwrap),
  applications: (params?: AnyRecord) => api.get("/organizer/applications", { params }).then(unwrap),
  decide: (organizerId: string, payload: { status: "APPROVED" | "REJECTED"; rejectionReason?: string }) =>
    api.patch(`/organizer/applications/${organizerId}/decision`, payload).then(unwrap),
  me: () => api.get("/organizer/me").then(unwrap),
  updateMe: (payload: AnyRecord) => api.patch("/organizer/me", payload).then(unwrap),
};

export const adminApi = {
  createAccount: (payload: AnyRecord) => api.post("/admin/accounts", payload).then(unwrap),
  users: (params?: AnyRecord) => api.get("/admin/users", { params }).then(unwrap),
  setUserStatus: (userId: string, status: "ACTIVE" | "BLOCKED") =>
    api.patch(`/admin/users/${userId}/status`, { status }).then(unwrap),
  auditLogs: (params?: AnyRecord) => api.get("/admin/audit-logs", { params }).then(unwrap),
  settings: () => api.get("/admin/settings").then(unwrap),
  upsertSetting: (key: string, payload: AnyRecord) =>
    api.put(`/admin/settings/${key}`, payload).then(unwrap),
};

export const categoryApi = {
  public: () => api.get<ApiResponse<Category[]>>("/categories/public").then(unwrap),
  all: () => api.get<ApiResponse<Category[]>>("/categories").then(unwrap),
  create: (payload: { name: string; description?: string }) =>
    api.post<ApiResponse<Category>>("/categories", payload).then(unwrap),
  update: (id: string, payload: AnyRecord) => api.patch(`/categories/${id}`, payload).then(unwrap),
  remove: (id: string) => api.delete(`/categories/${id}`).then(unwrap),
};

export const eventApi = {
  publicList: (params?: AnyRecord) =>
    api.get<ApiResponse<EventItem[]>>("/events/public", { params }).then(unwrap),
  publicDetails: (idOrSlug: string) =>
    api.get<ApiResponse<EventItem>>(`/events/public/${idOrSlug}`).then(unwrap),
  mine: () => api.get<ApiResponse<EventItem[]>>("/events/my-events").then(unwrap),
  create: (payload: AnyRecord) => api.post<ApiResponse<EventItem>>("/events", payload).then(unwrap),
  update: (id: string, payload: AnyRecord) =>
    api.patch<ApiResponse<EventItem>>(`/events/${id}`, payload).then(unwrap),
  uploadCover: (id: string, file: File) => {
    const form = new FormData();
    form.append("coverImage", file);
    return api.patch(`/events/${id}/cover`, form).then(unwrap);
  },
  uploadGallery: (id: string, files: File[]) => {
    const form = new FormData();
    files.forEach((file) => form.append("galleryImages", file));
    return api.patch(`/events/${id}/gallery`, form).then(unwrap);
  },
  submit: (id: string) => api.post(`/events/${id}/submit`).then(unwrap),
  publish: (id: string) => api.post(`/events/${id}/publish`).then(unwrap),
  cancel: (id: string, reason: string) => api.post(`/events/${id}/cancel`, { reason }).then(unwrap),
  adminList: (params?: AnyRecord) => api.get("/events/admin/all", { params }).then(unwrap),
  review: (id: string, payload: { decision: "APPROVED" | "REJECTED" | "CHANGES_REQUESTED"; reason?: string }) =>
    api.post(`/events/admin/${id}/review`, payload).then(unwrap),
  suspend: (id: string, reason: string) => api.post(`/events/admin/${id}/suspend`, { reason }).then(unwrap),
  restore: (id: string) => api.post(`/events/admin/${id}/restore`).then(unwrap),
};

export const ticketTypeApi = {
  publicForEvent: (eventId: string) =>
    api.get<ApiResponse<TicketType[]>>(`/ticket-types/event/${eventId}/public`).then(unwrap),
  create: (eventId: string, payload: AnyRecord) =>
    api.post(`/ticket-types/event/${eventId}`, payload).then(unwrap),
  update: (id: string, payload: AnyRecord) => api.patch(`/ticket-types/${id}`, payload).then(unwrap),
  remove: (id: string) => api.delete(`/ticket-types/${id}`).then(unwrap),
};

export const promoApi = {
  create: (payload: AnyRecord) => api.post("/promos", payload).then(unwrap),
  forEvent: (eventId: string) => api.get(`/promos/event/${eventId}`).then(unwrap),
  update: (id: string, payload: AnyRecord) => api.patch(`/promos/${id}`, payload).then(unwrap),
};

export const staffApi = {
  accept: (token: string) => api.post("/staff/accept", { token }).then(unwrap),
  assignments: () => api.get("/staff/my-assignments").then(unwrap),
  list: () => api.get("/staff").then(unwrap),
  invite: (payload: { name: string; email: string; eventIds: string[] }) =>
    api.post("/staff/invite", payload).then(unwrap),
  assign: (id: string, eventIds: string[]) =>
    api.patch(`/staff/${id}/assign`, { eventIds }).then(unwrap),
  revoke: (id: string) => api.delete(`/staff/${id}`).then(unwrap),
};

export const orderApi = {
  checkout: (payload: { ticketTypeId: string; quantity: number; promoCode?: string }) =>
    api.post("/orders/checkout", payload).then(unwrap),
  mine: () => api.get("/orders/my-orders").then(unwrap),
  details: (id: string) => api.get(`/orders/my-orders/${id}`).then(unwrap),
  myPayments: () => api.get("/payment/my-payments").then(unwrap),
  allPayments: () => api.get("/payment/all").then(unwrap),
};

export const ticketApi = {
  mine: () => api.get("/tickets/my-tickets").then(unwrap),
  details: (id: string) => api.get(`/tickets/my-tickets/${id}`).then(unwrap),
  downloadPdf: (id: string) => api.get(`/tickets/my-tickets/${id}/pdf`, { responseType: "blob" }),
  qrCheckIn: (payload: { eventId: string; qrPayload: string }) =>
    api.post("/tickets/check-in/qr", payload).then(unwrap),
  search: (eventId: string, search: string) =>
    api.get(`/tickets/check-in/event/${eventId}/search`, { params: { search } }).then(unwrap),
  manualCheckIn: (payload: { eventId: string; ticketId: string; confirm: boolean }) =>
    api.post("/tickets/check-in/manual", payload).then(unwrap),
};

export const refundApi = {
  request: (ticketId: string, reason: string) => api.post("/refunds", { ticketId, reason }).then(unwrap),
  organizer: () => api.get("/refunds/organizer").then(unwrap),
  all: () => api.get("/refunds/all").then(unwrap),
  decide: (id: string, payload: AnyRecord) => api.patch(`/refunds/${id}/decision`, payload).then(unwrap),
  complete: (id: string, gatewayRefundId: string) =>
    api.patch(`/refunds/${id}/complete`, { gatewayRefundId }).then(unwrap),
};

export const transferApi = {
  create: (ticketId: string, recipientEmail: string) =>
    api.post("/transfers", { ticketId, recipientEmail }).then(unwrap),
  accept: (token: string) => api.post("/transfers/accept", { token }).then(unwrap),
  mine: () => api.get("/transfers/mine").then(unwrap),
};

export const waitlistApi = {
  join: (ticketTypeId: string) => api.post("/waitlist", { ticketTypeId }).then(unwrap),
  leave: (ticketTypeId: string) => api.delete(`/waitlist/${ticketTypeId}`).then(unwrap),
  mine: () => api.get("/waitlist/mine").then(unwrap),
};

export const notificationApi = {
  mine: () => api.get("/notifications").then(unwrap),
  read: (id: string) => api.patch(`/notifications/${id}/read`).then(unwrap),
  readAll: () => api.patch("/notifications/read-all").then(unwrap),
};

export const announcementApi = {
  send: (payload: { eventId: string; title: string; message: string }) =>
    api.post("/announcements", payload).then(unwrap),
  forEvent: (eventId: string) => api.get(`/announcements/event/${eventId}`).then(unwrap),
};

export const reviewApi = {
  create: (payload: { eventId: string; rating: number; comment?: string; images?: string[] }) =>
    api.post("/reviews", payload).then(unwrap),
  forEvent: (eventId: string) => api.get(`/reviews/event/${eventId}`).then(unwrap),
  moderate: (id: string, status: "VISIBLE" | "HIDDEN") =>
    api.patch(`/reviews/${id}/moderate`, { status }).then(unwrap),
};

export const disputeApi = {
  create: (payload: AnyRecord) => api.post("/disputes", payload).then(unwrap),
  mine: () => api.get("/disputes/mine").then(unwrap),
  organizer: () => api.get("/disputes/organizer").then(unwrap),
  respond: (id: string, response: string) =>
    api.post(`/disputes/${id}/respond`, { response }).then(unwrap),
  admin: () => api.get("/disputes/admin/all").then(unwrap),
  decide: (id: string, payload: AnyRecord) =>
    api.patch(`/disputes/admin/${id}/decision`, payload).then(unwrap),
};

export const payoutApi = {
  request: (eventId: string) => api.post(`/payouts/event/${eventId}/request`).then(unwrap),
  mine: () => api.get("/payouts/mine").then(unwrap),
  all: () => api.get("/payouts/all").then(unwrap),
  updateStatus: (id: string, payload: AnyRecord) =>
    api.patch(`/payouts/${id}/status`, payload).then(unwrap),
};

export const analyticsApi = {
  attendee: () => api.get("/analytics/attendee").then(unwrap),
  organizer: () => api.get("/analytics/organizer").then(unwrap),
  staff: () => api.get("/analytics/staff").then(unwrap),
  admin: () => api.get("/analytics/admin").then(unwrap),
};

export const allApis = {
  authApi,
  profileApi,
  organizerApi,
  adminApi,
  categoryApi,
  eventApi,
  ticketTypeApi,
  promoApi,
  staffApi,
  orderApi,
  ticketApi,
  refundApi,
  transferApi,
  waitlistApi,
  notificationApi,
  announcementApi,
  reviewApi,
  disputeApi,
  payoutApi,
  analyticsApi,
};
