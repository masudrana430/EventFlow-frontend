"use client";

import { useState } from "react";
import { Alert } from "@/components/Alert";
import { getErrorMessage } from "@/lib/api";
import { organizerApi } from "@/lib/services";

export default function ApplyOrganizerPage() {
  const [step, setStep] = useState<"apply" | "verify" | "done">("apply");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    organizationName: "",
    organizationType: "Event Management",
    phone: "",
    address: "",
    experience: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");

  async function apply(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return setMessage("Please attach a verification document.");
    setMessage("");
    try {
      await organizerApi.apply({
        user: { name: form.name, email: form.email, password: form.password },
        organizer: {
          organizationName: form.organizationName,
          organizationType: form.organizationType,
          phone: form.phone,
          address: form.address,
          experience: form.experience,
        },
      }, file);
      setStep("verify");
    } catch (e) {
      setMessage(getErrorMessage(e));
    }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    try {
      await organizerApi.verify(form.email, otp);
      setStep("done");
    } catch (e) {
      setMessage(getErrorMessage(e));
    }
  }

  return (
    <main className="container-page py-14">
      <div className="mx-auto max-w-3xl">
        <span className="badge bg-indigo-100 text-indigo-700">Organizer onboarding</span>
        <h1 className="mt-4 page-title">Create events with EventFlow</h1>
        <p className="mt-3 text-slate-500">Organizer accounts require email verification and administrative approval before event creation is enabled.</p>

        {step === "apply" && (
          <form className="card mt-8" onSubmit={apply}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label><span className="label">Your name</span><input className="input" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} required /></label>
              <label><span className="label">Email</span><input className="input" type="email" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} required /></label>
              <label className="sm:col-span-2"><span className="label">Password</span><input className="input" type="password" minLength={8} value={form.password} onChange={(e)=>setForm({...form,password:e.target.value})} required /></label>
              <label><span className="label">Organization name</span><input className="input" value={form.organizationName} onChange={(e)=>setForm({...form,organizationName:e.target.value})} required /></label>
              <label><span className="label">Organization type</span><input className="input" value={form.organizationType} onChange={(e)=>setForm({...form,organizationType:e.target.value})} required /></label>
              <label><span className="label">Phone</span><input className="input" value={form.phone} onChange={(e)=>setForm({...form,phone:e.target.value})} required /></label>
              <label><span className="label">Address</span><input className="input" value={form.address} onChange={(e)=>setForm({...form,address:e.target.value})} required /></label>
              <label className="sm:col-span-2"><span className="label">Experience</span><textarea className="textarea" value={form.experience} onChange={(e)=>setForm({...form,experience:e.target.value})} required /></label>
              <label className="sm:col-span-2"><span className="label">Verification document</span><input className="input" type="file" accept=".pdf,image/*" onChange={(e)=>setFile(e.target.files?.[0] || null)} required /><p className="mt-2 text-xs text-slate-500">PDF, JPG, PNG or WEBP.</p></label>
            </div>
            {message && <div className="mt-4"><Alert type="error">{message}</Alert></div>}
            <button className="btn-primary mt-6">Submit application</button>
          </form>
        )}

        {step === "verify" && (
          <form className="card mt-8" onSubmit={verify}>
            <h2 className="text-2xl font-black">Verify your email</h2>
            <p className="mt-2 text-sm text-slate-500">We sent a six-digit organizer verification code to {form.email}.</p>
            <input className="input mt-6 text-center font-mono text-xl tracking-[.35em]" value={otp} onChange={(e)=>setOtp(e.target.value.replace(/\D/g,"").slice(0,6))} required />
            {message && <div className="mt-4"><Alert type="error">{message}</Alert></div>}
            <button className="btn-primary mt-5 w-full">Verify and submit for review</button>
          </form>
        )}

        {step === "done" && (
          <div className="card mt-8">
            <Alert type="success">Your organizer application is verified and pending administrative review. You will receive an email when a decision is made.</Alert>
          </div>
        )}
      </div>
    </main>
  );
}
