"use client";

import Link from "next/link";
import { useState } from "react";
import { GoogleLogin } from "@/components/GoogleLogin";
import { Alert } from "@/components/Alert";
import { getErrorMessage } from "@/lib/api";
import { login } from "@/lib/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const result = await login(email, password);
      if (result.data.user.mustChangePassword) {
        location.href = "/dashboard/security";
      } else {
        location.href = "/dashboard";
      }
    } catch (error) {
      setMessage(getErrorMessage(error, "Login failed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container-page flex min-h-[70vh] items-center justify-center py-14">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl md:grid-cols-2">
        <div className="hidden bg-slate-950 p-10 text-white md:block">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-indigo-300">Welcome back</p>
          <h1 className="mt-4 text-4xl font-black">Your EventFlow workspace is ready.</h1>
          <p className="mt-5 leading-7 text-slate-400">
            Sign in to manage tickets, events, staff, payments or platform operations based on your account role.
          </p>
        </div>
        <form onSubmit={submit} className="p-7 sm:p-10">
          <h2 className="text-3xl font-black">Sign in</h2>
          <p className="mt-2 text-sm text-slate-500">Use your EventFlow account credentials.</p>
          <div className="mt-7 space-y-4">
            <label className="block">
              <span className="label">Email</span>
              <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <label className="block">
              <span className="label">Password</span>
              <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </label>
          </div>
          {message && <div className="mt-4"><Alert type="error">{message}</Alert></div>}
          <button className="btn-primary mt-6 w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
          <GoogleLogin />
          <div className="mt-6 flex justify-between text-sm">
            <Link href="/forgot-password" className="font-semibold text-indigo-700">Forgot password?</Link>
            <Link href="/register" className="font-semibold text-slate-600">Create account</Link>
          </div>
        </form>
      </div>
    </main>
  );
}
