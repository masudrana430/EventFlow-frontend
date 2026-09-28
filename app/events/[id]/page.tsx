"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { CalendarDays, MapPin, ShieldCheck, Star, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Alert } from "@/components/Alert";
import { Loading } from "@/components/Loading";
import { getLocalUser } from "@/lib/auth";
import { getErrorMessage } from "@/lib/api";
import { eventApi, orderApi, waitlistApi } from "@/lib/services";
import { formatDate, formatMoney } from "@/lib/format";
import type { EventItem, TicketType } from "@/types";

export default function EventDetailsPage() {
  const params = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [selected, setSelected] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [promoCode, setPromoCode] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const user = typeof window !== "undefined" ? getLocalUser() : null;

  useEffect(() => {
    if (!params.id) return;
    eventApi.publicDetails(params.id)
      .then((r) => {
        setEvent(r.data);
        if (r.data.ticketTypes?.[0]) setSelected(r.data.ticketTypes[0].id);
      })
      .catch((e) => setMessage(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <main className="container-page py-12"><Loading label="Loading event..." /></main>;
  if (!event) return <main className="container-page py-12"><Alert type="error">{message || "Event not found"}</Alert></main>;

  const ticket = event.ticketTypes?.find((t) => t.id === selected);
  const available = (t: TicketType) => Math.max(0, t.quantity - Number(t.soldQuantity || 0) - Number(t.reservedQuantity || 0));

  async function checkout() {
    if (!ticket) return;
    if (!user) {
      sessionStorage.setItem("eventflow_after_login", location.pathname);
      location.href = "/login";
      return;
    }
    if (user.role !== "ATTENDEE") {
      setMessage("Only attendee accounts can purchase tickets.");
      return;
    }
    setMessage("");
    setSuccess("");
    try {
      const response: any = await orderApi.checkout({
        ticketTypeId: ticket.id,
        quantity,
        ...(promoCode ? { promoCode } : {}),
      });
      const data = response.data;
      if (data?.paymentUrl) {
        location.href = data.paymentUrl;
      } else {
        setSuccess("Free ticket order confirmed. Your digital ticket is ready.");
      }
    } catch (e) {
      setMessage(getErrorMessage(e, "Checkout failed"));
    }
  }

  async function joinWaitlist() {
    if (!ticket) return;
    if (!user) return void (location.href = "/login");
    try {
      await waitlistApi.join(ticket.id);
      setSuccess("You joined the waitlist for this ticket type.");
    } catch (e) {
      setMessage(getErrorMessage(e));
    }
  }

  return (
    <main>
      <section className="border-b border-slate-200 bg-white">
        <div className="container-page grid gap-8 py-10 lg:grid-cols-[1.2fr_.8fr]">
          <div className="overflow-hidden rounded-[2rem] bg-slate-100">
            {event.coverImageUrl ? <img src={event.coverImageUrl} alt={event.title} className="aspect-[16/9] h-full w-full object-cover" /> : <div className="grid aspect-[16/9] place-items-center text-slate-400"><CalendarDays className="h-14 w-14" /></div>}
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex flex-wrap gap-2"><span className="badge bg-indigo-100 text-indigo-700">{event.category?.name || "Event"}</span><span className="badge bg-slate-100 text-slate-700">{event.currency || "BDT"}</span></div>
            <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">{event.title}</h1>
            <p className="mt-4 text-lg leading-8 text-slate-500">{event.shortDescription}</p>
            <div className="mt-6 space-y-3 text-sm text-slate-600">
              <p className="flex gap-3"><CalendarDays className="h-5 w-5 text-indigo-600" /> {formatDate(event.startDateTime)}</p>
              <p className="flex gap-3"><MapPin className="h-5 w-5 text-indigo-600" /> {event.venueName || event.venueAddress}</p>
              <p className="flex gap-3"><Users className="h-5 w-5 text-indigo-600" /> {event.organizer?.organizationName || "EventFlow organizer"}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container-page grid gap-10 py-12 lg:grid-cols-[1fr_380px]">
        <div>
          <h2 className="section-title">About this event</h2>
          <p className="mt-5 whitespace-pre-line leading-8 text-slate-600">{event.description}</p>

          {event.galleryUrls && event.galleryUrls.length > 0 && (
            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {event.galleryUrls.map((url) => <img key={url} src={url} alt="" className="aspect-square rounded-2xl object-cover" />)}
            </div>
          )}

          <div className="mt-12">
            <h2 className="section-title">Recent reviews</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {(event.reviews || []).length ? event.reviews!.map((review: any, index) => (
                <div className="card" key={String(review.id || index)}>
                  <div className="flex items-center gap-2 font-bold"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {review.rating}/5</div>
                  <p className="mt-3 text-sm leading-6 text-slate-500">{review.comment || "Event review"}</p>
                </div>
              )) : <p className="text-sm text-slate-500">No public reviews yet.</p>}
            </div>
          </div>
        </div>

        <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
          <div className="flex items-center gap-2 text-sm font-bold text-emerald-700"><ShieldCheck className="h-4 w-4" /> Secure EventFlow checkout</div>
          <h2 className="mt-3 text-2xl font-black">Choose your ticket</h2>
          <div className="mt-5 space-y-3">
            {(event.ticketTypes || []).map((t) => (
              <label key={t.id} className={`block cursor-pointer rounded-2xl border p-4 ${selected === t.id ? "border-indigo-500 bg-indigo-50" : "border-slate-200"}`}>
                <div className="flex items-center justify-between gap-3">
                  <div><p className="font-bold">{t.name}</p><p className="mt-1 text-xs text-slate-500">{available(t)} available</p></div>
                  <div className="text-right font-black">{Number(t.price) === 0 ? "Free" : formatMoney(t.price, event.currency || "BDT")}</div>
                </div>
                <input className="sr-only" type="radio" name="ticket" checked={selected === t.id} onChange={() => setSelected(t.id)} />
              </label>
            ))}
          </div>

          {ticket && available(ticket) > 0 ? (
            <>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <label><span className="label">Quantity</span><input className="input" type="number" min={1} max={ticket.maxPerOrder || 10} value={quantity} onChange={(e)=>setQuantity(Math.max(1, Number(e.target.value)))} /></label>
                <label><span className="label">Promo code</span><input className="input" value={promoCode} onChange={(e)=>setPromoCode(e.target.value.toUpperCase())} placeholder="Optional" /></label>
              </div>
              <button className="btn-primary mt-5 w-full" onClick={checkout}>Continue to checkout</button>
            </>
          ) : ticket ? (
            <button className="btn-primary mt-5 w-full" onClick={joinWaitlist}>Join waitlist</button>
          ) : null}

          {message && <div className="mt-4"><Alert type="error">{message}</Alert></div>}
          {success && <div className="mt-4"><Alert type="success">{success}</Alert></div>}
          {!user && <p className="mt-4 text-center text-xs text-slate-500">You will be asked to <Link className="font-bold text-indigo-700" href="/login">sign in</Link> before checkout.</p>}
        </aside>
      </div>
    </main>
  );
}
