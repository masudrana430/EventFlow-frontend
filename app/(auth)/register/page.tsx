"use client";

import Link from "next/link";
import { useState } from "react";
import { Alert } from "@/components/Alert";
import { getErrorMessage } from "@/lib/api";
import { registerAttendee } from "@/lib/auth";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    location: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      await registerAttendee({
        name: form.name,
        email: form.email,
        password: form.password,
        attendee: {
          phone: form.phone || undefined,
          location: form.location || undefined,
        },
      });
      sessionStorage.setItem("eventflow_pending_email", form.email);
      location.href = "/verify-email";
    } catch (error) {
      setMessage(getErrorMessage(error, "Registration failed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container-page py-14">
      <form onSubmit={submit} className="card mx-auto max-w-2xl">
        <span className="badge bg-indigo-100 text-indigo-700">Attendee account</span>
        <h1 className="mt-4 page-title">Join EventFlow</h1>
        <p className="mt-2 text-slate-500">Create your attendee account. We will send a six-digit verification code to your email.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2"><span className="label">Full name</span><input className="input" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} required /></label>
          <label className="sm:col-span-2"><span className="label">Email</span><input className="input" type="email" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} required /></label>
          <label className="sm:col-span-2"><span className="label">Password</span><input className="input" type="password" minLength={8} value={form.password} onChange={(e)=>setForm({...form,password:e.target.value})} required /></label>
          <label><span className="label">Phone</span><input className="input" value={form.phone} onChange={(e)=>setForm({...form,phone:e.target.value})} /></label>
          <label><span className="label">Location</span><input className="input" value={form.location} onChange={(e)=>setForm({...form,location:e.target.value})} /></label>
        </div>
        {message && <div className="mt-4"><Alert type="error">{message}</Alert></div>}
        <button disabled={loading} className="btn-primary mt-6 w-full">{loading ? "Creating account..." : "Create account"}</button>
        <p className="mt-5 text-center text-sm text-slate-500">
          Want to run events instead? <Link href="/apply-organizer" className="font-bold text-indigo-700">Apply as organizer</Link>
        </p>
      </form>
    </main>
  );
}
