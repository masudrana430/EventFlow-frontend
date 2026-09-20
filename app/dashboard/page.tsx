"use client";
import { useEffect, useState } from "react";
import { getLocalUser } from "@/lib/auth";
import type { AuthUser } from "@/types";
export default function Dashboard() {
  const [user, setUser] = useState<AuthUser | null>(null);
  useEffect(() => setUser(getLocalUser()), []);
  if (!user) return <main className="container-page py-16"><div className="card"><h1 className="text-2xl font-bold">Please login first.</h1></div></main>;
  return <main className="container-page py-12"><p className="text-sm text-slate-500">{user.role}</p><h1 className="mt-1 text-4xl font-black">Welcome, {user.name}</h1><div className="mt-8 grid gap-6 md:grid-cols-3">{["Overview","Tickets & Orders","Activity"].map(x=><div key={x} className="card"><h2 className="text-xl font-bold">{x}</h2><p className="mt-2 text-slate-600">Ready for backend module integration.</p></div>)}</div></main>;
}
