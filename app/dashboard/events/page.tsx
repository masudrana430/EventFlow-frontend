"use client";

import Link from "next/link";
import { CalendarPlus, Settings2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Alert } from "@/components/Alert";
import { EmptyState, Loading } from "@/components/Loading";
import { getErrorMessage } from "@/lib/api";
import { eventApi } from "@/lib/services";
import { formatDate, statusClass } from "@/lib/format";
import type { EventItem } from "@/types";

export default function OrganizerEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const response = await eventApi.mine();
      setEvents(response.data || []);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><h1 className="page-title">My events</h1><p className="mt-2 text-slate-500">Create, prepare, submit and operate your EventFlow events.</p></div>
        <Link href="/dashboard/events/new" className="btn-primary"><CalendarPlus className="h-4 w-4" /> Create event</Link>
      </div>
      {error && <div className="mt-5"><Alert type="error">{error}</Alert></div>}
      {loading ? <Loading label="Loading events..." /> : !events.length ? <div className="mt-8"><EmptyState title="No events yet" description="Create a draft, upload its cover, add ticket inventory and submit it for review." /></div> : (
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {events.map((event)=>(
            <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white" key={event.id}>
              <div className="aspect-[16/7] bg-slate-100">{event.coverImageUrl && <img className="h-full w-full object-cover" src={event.coverImageUrl} alt={event.title} />}</div>
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div><span className={statusClass(event.status)}>{event.status}</span><h2 className="mt-3 text-xl font-black">{event.title}</h2></div>
                  <Link href={`/dashboard/events/${event.id}/manage`} className="btn-secondary !p-2.5"><Settings2 className="h-4 w-4" /></Link>
                </div>
                <p className="mt-3 text-sm text-slate-500">{formatDate(event.startDateTime)} · {event.venueName || event.venueAddress}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                  <span className="badge">{event.ticketTypes?.length || 0} ticket types</span><span className="badge">{event.currency || "BDT"}</span>
                  <span className="badge">Capacity {event.capacity || "—"}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
