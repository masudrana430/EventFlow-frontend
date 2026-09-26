"use client";

import Link from "next/link";
import { CalendarDays, LogOut, Menu, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { getLocalUser, logout } from "@/lib/auth";
import type { AuthUser } from "@/types";

export function Navbar() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setUser(getLocalUser());
    const sync = () => setUser(getLocalUser());
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  async function handleLogout() {
    await logout().catch(() => undefined);
    location.href = "/";
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-lg font-black">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-950 text-white">
            <CalendarDays className="h-5 w-5" />
          </span>
          Event<span className="-ml-2 text-indigo-600">Flow</span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium md:flex">
          <Link className="nav-link" href="/events">Events</Link>
          <Link className="nav-link" href="/apply-organizer">Organize</Link>
          {user ? (
            <>
              <Link className="nav-link" href="/dashboard">Dashboard</Link>
              <Link className="nav-link flex items-center gap-1.5" href="/profile">
                <UserRound className="h-4 w-4" /> {user.name}
              </Link>
              <button className="btn-ghost" onClick={handleLogout}>
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </>
          ) : (
            <>
              <Link className="btn-secondary !px-4 !py-2" href="/login">Sign in</Link>
              <Link className="btn-primary !px-4 !py-2" href="/register">Create account</Link>
            </>
          )}
        </nav>

        <button className="rounded-xl border p-2 md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Toggle navigation">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t bg-white md:hidden">
          <div className="container-page flex flex-col gap-3 py-4 text-sm font-medium">
            <Link href="/events" onClick={() => setOpen(false)}>Events</Link>
            <Link href="/apply-organizer" onClick={() => setOpen(false)}>Organize</Link>
            {user ? (
              <>
                <Link href="/dashboard" onClick={() => setOpen(false)}>Dashboard</Link>
                <Link href="/profile" onClick={() => setOpen(false)}>Profile</Link>
                <button className="text-left text-rose-600" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)}>Sign in</Link>
                <Link href="/register" onClick={() => setOpen(false)}>Create account</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
