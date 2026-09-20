"use client";
import { useEffect, useState } from "react";
import { verifyEmail } from "@/lib/auth";

export default function Verify() {
  const [email, setEmail] = useState(""); const [otp, setOtp] = useState(""); const [message, setMessage] = useState("");
  useEffect(() => setEmail(sessionStorage.getItem("eventflow_pending_email") || ""), []);
  async function submit(e: React.FormEvent) { e.preventDefault(); try { await verifyEmail(email, otp); sessionStorage.removeItem("eventflow_pending_email"); location.href = "/dashboard"; } catch (err: any) { setMessage(err?.response?.data?.message || "Verification failed"); } }
  return <main className="container-page flex min-h-[calc(100vh-64px)] items-center justify-center"><form onSubmit={submit} className="card w-full max-w-md"><h1 className="text-3xl font-bold">Verify email</h1><div className="mt-8 space-y-4"><input className="input" value={email} onChange={e=>setEmail(e.target.value)} type="email"/><input className="input" value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,"").slice(0,6))} placeholder="6-digit OTP"/></div>{message && <p className="mt-4 text-red-600">{message}</p>}<button className="btn-primary mt-6 w-full">Verify</button></form></main>;
}
