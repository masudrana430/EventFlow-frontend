"use client";
import Link from "next/link";
import { CalendarDays, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { getLocalUser, logoutLocal } from "@/lib/auth";
import type { AuthUser } from "@/types";

export function Navbar() {
  const [user, setUser] = useState<AuthUser | null>(null);
  useEffect(() => setUser(getLocalUser()), []);
  return (
    <header className="border-b bg-white">
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold"><CalendarDays className="h-5 w-5"/>EventFlow</Link>
        <nav className="flex items-center gap-3">
          <Link href="/events">Events</Link>
          {user ? <>
            <Link href="/dashboard">Dashboard</Link>
            <button onClick={() => { logoutLocal(); location.href = "/"; }} className="flex items-center gap-1"><LogOut className="h-4 w-4"/>Logout</button>
          </> : <>
            <Link href="/login" className="btn-secondary !px-4 !py-2">Login</Link>
            <Link href="/register" className="btn-primary !px-4 !py-2">Register</Link>
          </>}
        </nav>
      </div>
    </header>
  );
}
