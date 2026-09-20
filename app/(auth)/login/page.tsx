"use client";
import { useState } from "react";
import { login } from "@/lib/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setMessage("");
    try { await login(email, password); location.href = "/dashboard"; }
    catch (err: any) { setMessage(err?.response?.data?.message || "Login failed"); }
    finally { setLoading(false); }
  }
  return <main className="container-page flex min-h-[calc(100vh-64px)] items-center justify-center"><form onSubmit={submit} className="card w-full max-w-md"><h1 className="text-3xl font-bold">Welcome back</h1><div className="mt-8 space-y-4"><input className="input" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required/><input className="input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required/></div>{message && <p className="mt-4 text-red-600">{message}</p>}<button className="btn-primary mt-6 w-full" disabled={loading}>{loading ? "Signing in..." : "Login"}</button></form></main>;
}
