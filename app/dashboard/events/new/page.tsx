"use client";

import { useEffect, useState } from "react";
import { Alert } from "@/components/Alert";
import { getErrorMessage } from "@/lib/api";
import { categoryApi, eventApi } from "@/lib/services";
import type { Category } from "@/types";

const toIso = (value: string) => value ? new Date(value).toISOString() : undefined;

export default function CreateEventPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    categoryId: "",
    title: "",
    shortDescription: "",
    description: "",
    venueName: "",
    venueAddress: "",
    startDateTime: "",
    endDateTime: "",
    entryOpenTime: "",
    saleStartAt: "",
    saleEndAt: "",
    contactEmail: "",
    contactPhone: "",
    capacity: "100",
    policies: "Bring a valid digital ticket",
  });

  useEffect(() => {
    categoryApi.public().then((r)=>setCategories(r.data || [])).catch(()=>undefined);
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setMessage("");
    try {
      const response: any = await eventApi.create({
        categoryId: form.categoryId,
        title: form.title,
        shortDescription: form.shortDescription,
        description: form.description,
        venueName: form.venueName,
        venueAddress: form.venueAddress,
        startDateTime: toIso(form.startDateTime),
        endDateTime: toIso(form.endDateTime),
        entryOpenTime: toIso(form.entryOpenTime),
        saleStartAt: toIso(form.saleStartAt),
        saleEndAt: toIso(form.saleEndAt),
        contactEmail: form.contactEmail,
        contactPhone: form.contactPhone || undefined,
        capacity: Number(form.capacity),
        policies: form.policies.split("\n").map((x)=>x.trim()).filter(Boolean),
        refundPolicyType: "DEFAULT",
      });
      location.href = `/dashboard/events/${response.data.id}/manage`;
    } catch (e) {
      setMessage(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="page-title">Create a new event</h1>
      <p className="mt-2 text-slate-500">Start with the core details. You can upload media and configure ticketing after the draft is created.</p>
      <form onSubmit={submit} className="card mt-8">
        <div className="grid gap-4 md:grid-cols-2">
          <label><span className="label">Category</span><select className="input" value={form.categoryId} onChange={(e)=>setForm({...form,categoryId:e.target.value})} required><option value="">Select category</option>{categories.map((c)=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
          <label><span className="label">Capacity</span><input className="input" type="number" min={1} value={form.capacity} onChange={(e)=>setForm({...form,capacity:e.target.value})} required /></label>
          <label className="md:col-span-2"><span className="label">Event title</span><input className="input" value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})} required /></label>
          <label className="md:col-span-2"><span className="label">Short description</span><input className="input" value={form.shortDescription} onChange={(e)=>setForm({...form,shortDescription:e.target.value})} required /></label>
          <label className="md:col-span-2"><span className="label">Full description</span><textarea className="textarea min-h-36" value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})} required /></label>
          <label><span className="label">Venue name</span><input className="input" value={form.venueName} onChange={(e)=>setForm({...form,venueName:e.target.value})} required /></label>
          <label><span className="label">Venue address</span><input className="input" value={form.venueAddress} onChange={(e)=>setForm({...form,venueAddress:e.target.value})} required /></label>
          <label><span className="label">Event starts</span><input className="input" type="datetime-local" value={form.startDateTime} onChange={(e)=>setForm({...form,startDateTime:e.target.value})} required /></label>
          <label><span className="label">Event ends</span><input className="input" type="datetime-local" value={form.endDateTime} onChange={(e)=>setForm({...form,endDateTime:e.target.value})} required /></label>
          <label><span className="label">Entry opens</span><input className="input" type="datetime-local" value={form.entryOpenTime} onChange={(e)=>setForm({...form,entryOpenTime:e.target.value})} required /></label>
          <label><span className="label">Ticket sales start</span><input className="input" type="datetime-local" value={form.saleStartAt} onChange={(e)=>setForm({...form,saleStartAt:e.target.value})} required /></label>
          <label><span className="label">Ticket sales end</span><input className="input" type="datetime-local" value={form.saleEndAt} onChange={(e)=>setForm({...form,saleEndAt:e.target.value})} required /></label>
          <label><span className="label">Contact email</span><input className="input" type="email" value={form.contactEmail} onChange={(e)=>setForm({...form,contactEmail:e.target.value})} required /></label>
          <label><span className="label">Contact phone</span><input className="input" value={form.contactPhone} onChange={(e)=>setForm({...form,contactPhone:e.target.value})} /></label>
          <label className="md:col-span-2"><span className="label">Policies — one per line</span><textarea className="textarea" value={form.policies} onChange={(e)=>setForm({...form,policies:e.target.value})} /></label>
        </div>
        {message && <div className="mt-5"><Alert type="error">{message}</Alert></div>}
        <button className="btn-primary mt-6" disabled={loading}>{loading ? "Creating..." : "Create draft"}</button>
      </form>
    </div>
  );
}
