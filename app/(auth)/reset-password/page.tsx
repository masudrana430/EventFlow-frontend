"use client";

import { useEffect, useState } from "react";
import { Alert } from "@/components/Alert";
import { getErrorMessage } from "@/lib/api";
import { authApi } from "@/lib/services";

export default function ResetPasswordPage() {
  const [form, setForm] = useState({ email: "", otp: "", newPassword: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    setForm((v) => ({
      ...v,
      email: sessionStorage.getItem("eventflow_reset_email") || "",
    }));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await authApi.resetPassword(form);
      sessionStorage.removeItem("eventflow_reset_email");
      location.href = "/login";
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  }

  return (
    <main className="container-page flex min-h-[60vh] items-center justify-center py-14">
      <form className="card w-full max-w-md" onSubmit={submit}>
        <h1 className="text-3xl font-black">Choose a new password</h1>
        <div className="mt-6 space-y-4">
          <label>
            <span className="label">Email</span>
            <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </label>
          <label>
            <span className="label">Reset code</span>
            <input className="input" value={form.otp} onChange={(e) => setForm({ ...form, otp: e.target.value.replace(/\D/g, "").slice(0, 6) })} required />
          </label>
          <label>
            <span className="label">New password</span>
            <input className="input" type="password" minLength={8} value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} required />
          </label>
        </div>
        {message && <div className="mt-4"><Alert type="error">{message}</Alert></div>}
        <button className="btn-primary mt-6 w-full">Update password</button>
      </form>
    </main>
  );
}
