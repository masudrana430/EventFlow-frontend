"use client";

import { useEffect, useState } from "react";
import { Alert } from "@/components/Alert";
import { getErrorMessage } from "@/lib/api";
import { verifyEmail } from "@/lib/auth";
import { authApi } from "@/lib/services";

export default function VerifyEmailPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setEmail(sessionStorage.getItem("eventflow_pending_email") || "");
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      await verifyEmail(email, otp);
      sessionStorage.removeItem("eventflow_pending_email");
      location.href = "/dashboard";
    } catch (error) {
      setMessage(getErrorMessage(error, "Verification failed"));
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    setMessage("");
    setSuccess("");
    try {
      const response: any = await authApi.resendOtp(email);
      setSuccess(response.message || "A new verification code was sent.");
    } catch (error) {
      setMessage(getErrorMessage(error, "Could not resend OTP"));
    }
  }

  return (
    <main className="container-page flex min-h-[65vh] items-center justify-center py-14">
      <form onSubmit={submit} className="card w-full max-w-lg">
        <span className="badge bg-indigo-100 text-indigo-700">Email verification</span>
        <h1 className="mt-4 page-title">Enter your six-digit code</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">Check your inbox for the EventFlow verification email.</p>
        <div className="mt-7 space-y-4">
          <label><span className="label">Email</span><input className="input" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required /></label>
          <label><span className="label">Verification code</span><input className="input text-center font-mono text-xl tracking-[.35em]" value={otp} onChange={(e)=>setOtp(e.target.value.replace(/\D/g,"").slice(0,6))} inputMode="numeric" required /></label>
        </div>
        {message && <div className="mt-4"><Alert type="error">{message}</Alert></div>}
        {success && <div className="mt-4"><Alert type="success">{success}</Alert></div>}
        <button className="btn-primary mt-6 w-full" disabled={loading || otp.length !== 6}>{loading ? "Verifying..." : "Verify account"}</button>
        <button type="button" onClick={resend} className="btn-ghost mt-3 w-full">Send a new code</button>
      </form>
    </main>
  );
}
