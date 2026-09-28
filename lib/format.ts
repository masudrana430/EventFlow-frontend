import type { Currency } from "@/types";

export function formatMoney(
  value: number | string | null | undefined,
  currency: Currency = "BDT",
) {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat(currency === "USD" ? "en-US" : "en-BD", {
    style: "currency",
    currency,
    minimumFractionDigits: currency === "USD" ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function formatDate(value?: string | Date | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-BD", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function statusClass(status?: string) {
  const value = String(status || "").toUpperCase();
  if (["PAID","APPROVED","PUBLISHED","COMPLETED","VALID","ACTIVE","VISIBLE","ELIGIBLE"].includes(value)) {
    return "badge badge-success";
  }
  if (["REJECTED","FAILED","CANCELLED","BLOCKED","EXPIRED","HIDDEN"].includes(value)) {
    return "badge badge-danger";
  }
  if (["PENDING","PENDING_REVIEW","PROCESSING","REQUESTED","ONGOING","OFFERED","UNDER_REVIEW"].includes(value)) {
    return "badge badge-warning";
  }
  return "badge";
}

export function compactId(value?: string) {
  if (!value) return "—";
  return value.length > 14 ? `${value.slice(0, 7)}…${value.slice(-5)}` : value;
}
