"use client";

import Link from "next/link";
import { Bell, CalendarDays, CreditCard, ShieldCheck, Ticket, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Alert } from "@/components/Alert";
import { Loading } from "@/components/Loading";
import { getErrorMessage } from "@/lib/api";
import { getLocalUser } from "@/lib/auth";
import { analyticsApi, notificationApi } from "@/lib/services";
import type { AuthUser } from "@/types";

function metricEntries(data: any) {
  const source = data?.data ?? data ?? {};
  return Object.entries(source)
    .filter(([, value]) => ["number", "string"].includes(typeof value))
    .slice(0, 8);
}

export default function DashboardPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const local = getLocalUser();
    setUser(local);
    if (!local) return;
    const analyticsRequest =
      local.role === "ATTENDEE"
        ? analyticsApi.attendee()
        : local.role === "ORGANIZER"
          ? analyticsApi.organizer()
          : local.role === "EVENT_STAFF"
            ? analyticsApi.staff()
            : analyticsApi.admin();

    Promise.all([
      analyticsRequest.catch((e) => ({ error: e })),
      notificationApi.mine().catch(() => ({ data: [] })),
    ]).then(([a, n]: any[]) => {
      if (a?.error) setError(getErrorMessage(a.error));
      else setAnalytics(a);
      setNotifications(Array.isArray(n?.data) ? n.data.slice(0, 5) : []);
    });
  }, []);

  const actions = useMemo(() => {
    if (!user) return [];
    if (user.role === "ATTENDEE") {
      return [
        ["/events", "Browse events", CalendarDays],
        ["/dashboard/orders", "My orders", CreditCard],
        ["/dashboard/tickets", "My tickets", Ticket],
      ] as const;
    }
    if (user.role === "ORGANIZER") {
      return [
        ["/dashboard/events/new", "Create event", CalendarDays],
        ["/dashboard/events", "Manage events", ShieldCheck],
        ["/dashboard/staff", "Manage staff", Users],
      ] as const;
    }
    if (user.role === "EVENT_STAFF") {
      return [
        ["/dashboard/check-in", "Open check-in", Ticket],
        ["/dashboard/check-in", "My assignments", CalendarDays],
      ] as const;
    }
    return [
      ["/dashboard/admin", "Admin center", ShieldCheck],
      ["/dashboard/admin", "Platform users", Users],
      ["/dashboard/finance", "Finance queues", CreditCard],
    ] as const;
  }, [user]);

  if (!user) return <Loading label="Loading dashboard..." />;

  return (
    <div>
      <span className="badge bg-indigo-100 text-indigo-700">{user.role.replace("_", " ")}</span>
      <h1 className="mt-3 page-title">Welcome back, {user.name.split(" ")[0]}</h1>
      <p className="mt-2 text-slate-500">Here is the latest view of your EventFlow workspace.</p>

      {error && <div className="mt-6"><Alert type="error">{error}</Alert></div>}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {analytics ? metricEntries(analytics).map(([key, value]) => (
          <div className="card" key={key}>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{String(key).replace(/([A-Z])/g, " $1").replace(/_/g, " ")}</p>
            <p className="mt-3 text-3xl font-black">{String(value)}</p>
          </div>
        )) : <div className="sm:col-span-2"><Loading label="Loading analytics..." /></div>}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_.8fr]">
        <div className="card">
          <h2 className="text-xl font-black">Quick actions</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {actions.map(([href, label, Icon]) => (
              <Link key={label} href={href} className="rounded-2xl border border-slate-200 p-4 hover:border-indigo-300 hover:bg-indigo-50">
                <Icon className="h-5 w-5 text-indigo-600" />
                <p className="mt-3 text-sm font-bold">{label}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black">Recent notifications</h2>
            <Link href="/dashboard/notifications" className="text-sm font-bold text-indigo-700">View all</Link>
          </div>
          <div className="mt-5 space-y-3">
            {notifications.length ? notifications.map((n) => (
              <div key={n.id} className="rounded-2xl bg-slate-50 p-4">
                <div className="flex gap-3">
                  <Bell className="mt-0.5 h-4 w-4 text-indigo-600" />
                  <div>
                    <p className="text-sm font-bold">{n.title}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{n.message}</p>
                  </div>
                </div>
              </div>
            )) : <p className="text-sm text-slate-500">No notifications yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
