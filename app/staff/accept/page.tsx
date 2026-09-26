"use client";

import { useState } from "react";
import { Alert } from "@/components/Alert";
import { getErrorMessage } from "@/lib/api";
import { staffApi } from "@/lib/services";

export default function AcceptStaffPage() {
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    try {
      await staffApi.accept(token);
      setSuccess("Invitation accepted. You can now sign in using the temporary password from your email.");
    } catch (e) {
      setMessage(getErrorMessage(e));
    }
  }

  return <main className="container-page flex min-h-[60vh] items-center justify-center py-14">
    <form className="card w-full max-w-lg" onSubmit={submit}>
      <span className="badge bg-indigo-100 text-indigo-700">Event staff invitation</span>
      <h1 className="mt-4 text-3xl font-black">Accept your staff invitation</h1>
      <p className="mt-2 text-sm leading-6 text-slate-500">Paste the invitation token from your EventFlow staff email. Invitations expire after 48 hours.</p>
      <label className="mt-6 block"><span className="label">Invitation token</span><textarea className="textarea font-mono text-xs" value={token} onChange={(e)=>setToken(e.target.value.trim())} required /></label>
      {message && <div className="mt-4"><Alert type="error">{message}</Alert></div>}
      {success && <div className="mt-4"><Alert type="success">{success}</Alert></div>}
      <button className="btn-primary mt-6 w-full">Accept invitation</button>
    </form>
  </main>;
}
