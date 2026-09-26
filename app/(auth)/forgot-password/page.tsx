"use client";

import { useState } from "react";
import { Alert } from "@/components/Alert";
import { getErrorMessage } from "@/lib/api";
import { authApi } from "@/lib/services";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await authApi.forgotPassword(email);
      sessionStorage.setItem("eventflow_reset_email", email);
      location.href = "/reset-password";
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  }

  return <main className="container-page flex min-h-[60vh] items-center justify-center py-14">
    <form className="card w-full max-w-md" onSubmit={submit}>
      <h1 className="text-3xl font-black">Reset your password</h1>
      <p className="mt-2 text-sm text-slate-500">We will send a secure verification code to your account email.</p>
      <label className="mt-6 block"><span className="label">Email</span><input className="input" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required /></label>
      {message && <div className="mt-4"><Alert type="error">{message}</Alert></div>}
      <button className="btn-primary mt-6 w-full">Send reset code</button>
    </form>
  </main>;
}
