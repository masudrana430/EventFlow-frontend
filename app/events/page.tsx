"use client";

import Link from "next/link";
import { CalendarDays, MapPin, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Alert } from "@/components/Alert";
import { EmptyState, Loading } from "@/components/Loading";
import { getErrorMessage } from "@/lib/api";
import { categoryApi, eventApi } from "@/lib/services";
import { formatDate, formatMoney } from "@/lib/format";
import type { Category, EventItem } from "@/types";

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState({ searchTerm: "", location: "", categoryId: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load(next = filters) {
    setLoading(true);
    setError("");
    try {
      const response = await eventApi.publicList({
        page: 1,
        limit: 30,
        ...Object.fromEntries(Object.entries(next).filter(([,value]) => value)),
      });
      setEvents(response.data || []);
    } catch (e) {
      setError(getErrorMessage(e, "Could not load events"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    categoryApi.public().then((r) => setCategories(r.data || [])).catch(() => undefined);
    load();
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    load();
  }

  return (
    <main className="container-page py-12">
      <div className="max-w-3xl">
        <span className="badge bg-indigo-100 text-indigo-700">Discover events</span>
        <h1 className="mt-4 page-title">Find your next experience</h1>
        <p className="mt-3 text-slate-500">Search live EventFlow events by keyword, category and location.</p>
      </div>

      <form onSubmit={submit} className="card mt-8 grid gap-3 md:grid-cols-[1fr_.8fr_.8fr_auto]">
        <label><span className="label">Search</span><div className="relative"><Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" /><input className="input pl-10" value={filters.searchTerm} onChange={(e)=>setFilters({...filters,searchTerm:e.target.value})} placeholder="Technology, music..." /></div></label>
        <label><span className="label">Location</span><input className="input" value={filters.location} onChange={(e)=>setFilters({...filters,location:e.target.value})} placeholder="Dhaka, Chattogram..." /></label>
        <label><span className="label">Category</span><select className="input" value={filters.categoryId} onChange={(e)=>setFilters({...filters,categoryId:e.target.value})}><option value="">All categories</option>{categories.map((c)=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
        <button className="btn-primary self-end">Search</button>
      </form>

      {error && <div className="mt-6"><Alert type="error">{error}</Alert></div>}
      {loading ? <Loading label="Finding events..." /> : events.length === 0 ? (
        <div className="mt-8"><EmptyState title="No events found" description="Try a broader search or check back for newly published events." /></div>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {events.map((event) => {
            const prices = (event.ticketTypes || []).map((t) => Number(t.price));
            const minPrice = prices.length ? Math.min(...prices) : 0;
            return (
              <article key={event.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="aspect-[16/9] bg-slate-200">
                  {event.coverImageUrl ? <img src={event.coverImageUrl} alt={event.title} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-slate-400"><CalendarDays className="h-10 w-10" /></div>}
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-2"><span className="badge">{event.category?.name || "Event"}</span><span className="badge bg-slate-100 text-slate-700">{event.currency || "BDT"}</span></div>
                    <span className="text-sm font-bold text-indigo-700">{minPrice > 0 ? `From ${formatMoney(minPrice, event.currency || "BDT")}` : "Free / ticketed"}</span>
                  </div>
                  <h2 className="mt-4 text-xl font-black">{event.title}</h2>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{event.shortDescription || event.description}</p>
                  <div className="mt-5 space-y-2 text-sm text-slate-600">
                    <p className="flex gap-2"><CalendarDays className="h-4 w-4 shrink-0" /> {formatDate(event.startDateTime)}</p>
                    <p className="flex gap-2"><MapPin className="h-4 w-4 shrink-0" /> {event.venueName || event.venueAddress || "Venue TBA"}</p>
                  </div>
                  <Link className="btn-secondary mt-6 w-full" href={`/events/${event.slug || event.id}`}>View event</Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
