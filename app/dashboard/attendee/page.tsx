"use client";

import { useEffect, useState } from "react";
import { Alert } from "@/components/Alert";
import { EmptyState, Loading } from "@/components/Loading";
import { getErrorMessage } from "@/lib/api";
import {
  disputeApi,
  orderApi,
  refundApi,
  reviewApi,
  ticketApi,
  transferApi,
  waitlistApi,
} from "@/lib/services";
import { formatDate, statusClass } from "@/lib/format";

type Tab = "transfer" | "refund" | "waitlist" | "disputes" | "reviews";

export default function AttendeeToolsPage() {
  const [tab, setTab] = useState<Tab>("transfer");
  const [tickets, setTickets] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [waitlist, setWaitlist] = useState<any[]>([]);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [forms, setForms] = useState({
    transferTicketId: "",
    recipientEmail: "",
    transferToken: "",
    refundTicketId: "",
    refundReason: "",
    waitlistTicketTypeId: "",
    disputeOrderId: "",
    disputeTicketId: "",
    disputeReason: "",
    disputeDescription: "",
    reviewEventId: "",
    reviewRating: 5,
    reviewComment: "",
  });

  async function load() {
    setLoading(true);
    try {
      const [t,o,tr,w,d]: any[] = await Promise.all([
        ticketApi.mine(),
        orderApi.mine(),
        transferApi.mine(),
        waitlistApi.mine(),
        disputeApi.mine(),
      ]);
      setTickets(t.data || []);
      setOrders(o.data || []);
      setTransfers(tr.data || []);
      setWaitlist(w.data || []);
      setDisputes(d.data || []);
    } catch (e) {
      setMessage(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const run = async (fn: () => Promise<any>, ok: string) => {
    setMessage(""); setSuccess("");
    try { await fn(); setSuccess(ok); await load(); }
    catch (e) { setMessage(getErrorMessage(e)); }
  };

  if (loading) return <Loading label="Loading attendee tools..." />;

  return (
    <div>
      <h1 className="page-title">Ticket tools</h1>
      <p className="mt-2 text-slate-500">Transfers, refunds, waitlists, disputes and reviews in one place.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {(["transfer","refund","waitlist","disputes","reviews"] as Tab[]).map((value)=>(
          <button key={value} onClick={()=>setTab(value)} className={tab===value ? "btn-primary !py-2" : "btn-secondary !py-2"}>
            {value[0].toUpperCase()+value.slice(1)}
          </button>
        ))}
      </div>

      {message && <div className="mt-5"><Alert type="error">{message}</Alert></div>}
      {success && <div className="mt-5"><Alert type="success">{success}</Alert></div>}

      {tab === "transfer" && (
        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          <form className="card" onSubmit={(e)=>{e.preventDefault();run(()=>transferApi.create(forms.transferTicketId,forms.recipientEmail),"Transfer invitation created.");}}>
            <h2 className="text-xl font-black">Transfer a ticket</h2>
            <div className="mt-5 space-y-4">
              <label><span className="label">Ticket</span><select className="input" value={forms.transferTicketId} onChange={(e)=>setForms({...forms,transferTicketId:e.target.value})} required><option value="">Select ticket</option>{tickets.filter((t)=>t.status==="VALID").map((t)=><option value={t.id} key={t.id}>{t.event?.title || "Event"} — {t.ticketType?.name || t.id}</option>)}</select></label>
              <label><span className="label">Recipient email</span><input className="input" type="email" value={forms.recipientEmail} onChange={(e)=>setForms({...forms,recipientEmail:e.target.value})} required /></label>
            </div>
            <button className="btn-primary mt-5">Create transfer</button>
          </form>
          <form className="card" onSubmit={(e)=>{e.preventDefault();run(()=>transferApi.accept(forms.transferToken),"Ticket transfer accepted.");}}>
            <h2 className="text-xl font-black">Accept a transfer</h2>
            <p className="mt-2 text-sm text-slate-500">Use the secure token from your EventFlow transfer email.</p>
            <textarea className="textarea mt-5 font-mono text-xs" value={forms.transferToken} onChange={(e)=>setForms({...forms,transferToken:e.target.value.trim()})} required />
            <button className="btn-secondary mt-5">Accept transfer</button>
          </form>
          <div className="xl:col-span-2">
            <h3 className="mb-3 font-black">My transfers</h3>
            {!transfers.length ? <EmptyState title="No transfer activity" description="Created or received transfers will appear here." /> : <div className="table-wrap"><table><thead><tr><th>Event</th><th>Recipient</th><th>Status</th><th>Expires</th></tr></thead><tbody>{transfers.map((x)=><tr key={x.id}><td>{x.ticket?.event?.title || x.event?.title || "Ticket transfer"}</td><td>{x.recipientEmail || "—"}</td><td><span className={statusClass(x.status)}>{x.status}</span></td><td>{formatDate(x.expiresAt)}</td></tr>)}</tbody></table></div>}
          </div>
        </div>
      )}

      {tab === "refund" && (
        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          <form className="card" onSubmit={(e)=>{e.preventDefault();run(()=>refundApi.request(forms.refundTicketId,forms.refundReason),"Refund request submitted.");}}>
            <h2 className="text-xl font-black">Request a refund</h2>
            <div className="mt-5 space-y-4">
              <label><span className="label">Ticket</span><select className="input" value={forms.refundTicketId} onChange={(e)=>setForms({...forms,refundTicketId:e.target.value})} required><option value="">Select ticket</option>{tickets.map((t)=><option value={t.id} key={t.id}>{t.event?.title || "Event"} — {t.ticketType?.name || t.id}</option>)}</select></label>
              <label><span className="label">Reason</span><textarea className="textarea" value={forms.refundReason} onChange={(e)=>setForms({...forms,refundReason:e.target.value})} required /></label>
            </div>
            <button className="btn-primary mt-5">Submit refund request</button>
          </form>
          <div className="card">
            <h2 className="text-xl font-black">Refund policy</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">Eligibility depends on the event, ticket type, event timing and active disputes. EventFlow validates the request before creating a refund record.</p>
          </div>
        </div>
      )}

      {tab === "waitlist" && (
        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          <form className="card" onSubmit={(e)=>{e.preventDefault();run(()=>waitlistApi.join(forms.waitlistTicketTypeId),"Added to waitlist.");}}>
            <h2 className="text-xl font-black">Join a sold-out waitlist</h2>
            <label className="mt-5 block"><span className="label">Ticket type ID</span><input className="input font-mono text-xs" value={forms.waitlistTicketTypeId} onChange={(e)=>setForms({...forms,waitlistTicketTypeId:e.target.value})} placeholder="Paste ticket type ID" required /></label>
            <button className="btn-primary mt-5">Join waitlist</button>
          </form>
          <div className="card">
            <h2 className="text-xl font-black">My waitlist entries</h2>
            <div className="mt-4 space-y-3">
              {waitlist.length ? waitlist.map((entry)=><div className="rounded-2xl bg-slate-50 p-4" key={entry.id}><div className="flex items-center justify-between gap-3"><p className="font-bold">{entry.ticketType?.name || "Ticket waitlist"}</p><span className={statusClass(entry.status)}>{entry.status}</span></div><button className="mt-3 text-xs font-bold text-rose-600" onClick={()=>run(()=>waitlistApi.leave(entry.ticketTypeId),"Left waitlist.")}>Leave waitlist</button></div>) : <p className="text-sm text-slate-500">No waitlist entries.</p>}
            </div>
          </div>
        </div>
      )}

      {tab === "disputes" && (
        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          <form className="card" onSubmit={(e)=>{e.preventDefault();run(()=>disputeApi.create({orderId:forms.disputeOrderId,ticketId:forms.disputeTicketId||undefined,reason:forms.disputeReason,description:forms.disputeDescription,evidenceUrls:[]}),"Dispute opened.");}}>
            <h2 className="text-xl font-black">Open a dispute</h2>
            <div className="mt-5 space-y-4">
              <label><span className="label">Order</span><select className="input" value={forms.disputeOrderId} onChange={(e)=>setForms({...forms,disputeOrderId:e.target.value})} required><option value="">Select order</option>{orders.map((o)=><option value={o.id} key={o.id}>{o.orderNumber || o.id} — {o.event?.title || "Event"}</option>)}</select></label>
              <label><span className="label">Ticket (optional)</span><select className="input" value={forms.disputeTicketId} onChange={(e)=>setForms({...forms,disputeTicketId:e.target.value})}><option value="">Whole order</option>{tickets.map((t)=><option value={t.id} key={t.id}>{t.event?.title || "Event"} — {t.ticketType?.name || t.id}</option>)}</select></label>
              <label><span className="label">Reason</span><input className="input" value={forms.disputeReason} onChange={(e)=>setForms({...forms,disputeReason:e.target.value})} required /></label>
              <label><span className="label">Description</span><textarea className="textarea" value={forms.disputeDescription} onChange={(e)=>setForms({...forms,disputeDescription:e.target.value})} required /></label>
            </div>
            <button className="btn-primary mt-5">Open dispute</button>
          </form>
          <div className="card">
            <h2 className="text-xl font-black">My disputes</h2>
            <div className="mt-4 space-y-3">
              {disputes.length ? disputes.map((d)=><div className="rounded-2xl bg-slate-50 p-4" key={d.id}><div className="flex items-center justify-between gap-3"><p className="font-bold">{d.reason}</p><span className={statusClass(d.status)}>{d.status}</span></div><p className="mt-2 text-sm text-slate-500">{d.description}</p></div>) : <p className="text-sm text-slate-500">No disputes.</p>}
            </div>
          </div>
        </div>
      )}

      {tab === "reviews" && (
        <form className="card mt-8 max-w-2xl" onSubmit={(e)=>{e.preventDefault();run(()=>reviewApi.create({eventId:forms.reviewEventId,rating:forms.reviewRating,comment:forms.reviewComment,images:[]}),"Review published.");}}>
          <h2 className="text-xl font-black">Review a completed event</h2>
          <p className="mt-2 text-sm text-slate-500">Reviews are accepted only when the event is completed and you own an eligible ticket.</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2"><span className="label">Event ID</span><input className="input font-mono text-xs" value={forms.reviewEventId} onChange={(e)=>setForms({...forms,reviewEventId:e.target.value})} required /></label>
            <label><span className="label">Rating</span><select className="input" value={forms.reviewRating} onChange={(e)=>setForms({...forms,reviewRating:Number(e.target.value)})}>{[5,4,3,2,1].map((n)=><option key={n}>{n}</option>)}</select></label>
            <label className="sm:col-span-2"><span className="label">Comment</span><textarea className="textarea" value={forms.reviewComment} onChange={(e)=>setForms({...forms,reviewComment:e.target.value})} /></label>
          </div>
          <button className="btn-primary mt-5">Submit review</button>
        </form>
      )}
    </div>
  );
}
