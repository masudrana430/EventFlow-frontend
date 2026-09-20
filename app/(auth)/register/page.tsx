"use client";
import { useState } from "react";
import { registerAttendee } from "@/lib/auth";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", location: "" });
  const [message, setMessage] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await registerAttendee({ name: form.name, email: form.email, password: form.password, attendee: { phone: form.phone || undefined, location: form.location || undefined } });
      sessionStorage.setItem("eventflow_pending_email", form.email);
      location.href = "/verify-email";
    } catch (err: any) { setMessage(err?.response?.data?.message || "Registration failed"); }
  }
  return <main className="container-page flex min-h-[calc(100vh-64px)] items-center justify-center py-12"><form onSubmit={submit} className="card w-full max-w-xl"><h1 className="text-3xl font-bold">Create attendee account</h1><div className="mt-8 grid gap-4 sm:grid-cols-2"><input className="input sm:col-span-2" placeholder="Full name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/><input className="input sm:col-span-2" type="email" placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/><input className="input sm:col-span-2" type="password" placeholder="Password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required/><input className="input" placeholder="Phone (optional)" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/><input className="input" placeholder="Location (optional)" value={form.location} onChange={e=>setForm({...form,location:e.target.value})}/></div>{message && <p className="mt-4 text-red-600">{message}</p>}<button className="btn-primary mt-6 w-full">Create account</button></form></main>;
}
