"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Bell,
  CalendarRange,
  CreditCard,
  LayoutDashboard,
  QrCode,
  Settings,
  ShieldCheck,
  Ticket,
  Users,
  WalletCards,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getLocalUser } from "@/lib/auth";
import type { AuthUser, UserRole } from "@/types";

const common = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/security", label: "Security", icon: ShieldCheck },
];

const byRole: Record<UserRole, Array<{ href: string; label: string; icon: any }>> = {
  ATTENDEE: [
    { href: "/dashboard/orders", label: "Orders", icon: CreditCard },
    { href: "/dashboard/tickets", label: "Tickets", icon: Ticket },
    { href: "/dashboard/attendee", label: "Ticket tools", icon: WalletCards },
  ],
  ORGANIZER: [
    { href: "/dashboard/events", label: "My events", icon: CalendarRange },
    { href: "/dashboard/staff", label: "Event staff", icon: Users },
    { href: "/dashboard/finance", label: "Refunds & payouts", icon: WalletCards },
  ],
  EVENT_STAFF: [
    { href: "/dashboard/check-in", label: "Check-in", icon: QrCode },
  ],
  ADMIN: [
    { href: "/dashboard/admin", label: "Admin center", icon: Settings },
    { href: "/dashboard/finance", label: "Refunds & payouts", icon: WalletCards },
  ],
  SUPER_ADMIN: [
    { href: "/dashboard/admin", label: "Admin center", icon: Settings },
    { href: "/dashboard/finance", label: "Refunds & payouts", icon: WalletCards },
  ],
};

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const local = getLocalUser();
    if (!local) {
      router.replace("/login");
      return;
    }
    setUser(local);
  }, [router]);

  const links = useMemo(() => {
    if (!user) return common;
    return [...common, ...(byRole[user.role] || [])];
  }, [user]);

  if (!user) {
    return <div className="container-page py-16 text-sm text-slate-500">Loading workspace…</div>;
  }

  return (
    <div className="container-page grid gap-8 py-8 lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-4 lg:sticky lg:top-24">
        <div className="border-b border-slate-100 px-3 pb-4">
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">{user.role.replace("_", " ")}</p>
          <p className="mt-1 truncate font-bold">{user.name}</p>
          <p className="truncate text-xs text-slate-500">{user.email}</p>
        </div>
        <nav className="mt-4 space-y-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
            return (
              <Link
                href={href}
                key={href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${active ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"}`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
          <Link href="/profile" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100">
            <Users className="h-4 w-4" /> Profile
          </Link>
        </nav>
        <div className="mt-5 rounded-2xl bg-indigo-50 p-3 text-xs leading-5 text-indigo-800">
          <BarChart3 className="mb-2 h-4 w-4" />
          Your workspace only shows tools allowed for your account role.
        </div>
      </aside>
      <section className="min-w-0">{children}</section>
    </div>
  );
}
