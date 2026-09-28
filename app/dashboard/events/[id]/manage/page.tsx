"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert } from "@/components/Alert";
import { Loading } from "@/components/Loading";
import { getErrorMessage } from "@/lib/api";
import {
  announcementApi,
  eventApi,
  payoutApi,
  promoApi,
  ticketTypeApi,
} from "@/lib/services";
import { formatDate, formatMoney, statusClass } from "@/lib/format";

export default function ManageEventPage() {
  const params = useParams<{ id: string }>();
  const [event, setEvent] = useState<any>(null);
  const [promos, setPromos] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");
  const [ticketForm, setTicketForm] = useState({
    name:"General Admission", description:"General admission ticket", price:"0", quantity:"100", maxPerOrder:"5",
    saleStartAt:"", saleEndAt:"", transferable:true, refundable:true, benefits:"General admission",
  });
  const [promoForm, setPromoForm] = useState({ code:"", value:"10", maxUses:"100", startAt:"", endAt:"" });
  const [announcement, setAnnouncement] = useState({ title:"", message:"" });
  const [editForm, setEditForm] = useState({
    shortDescription:"",
    contactPhone:"",
    currency:"BDT" as "BDT" | "USD",
  });

  async function load() {
    try {
      const mine = await eventApi.mine();
      const found = mine.data.find((x:any)=>x.id===params.id);
      setEvent(found || null);
      if (found) {
        setEditForm({
          shortDescription: found.shortDescription || "",
          contactPhone: found.contactPhone || "",
          currency: found.currency || "BDT",
        });
      }
      const p:any = await promoApi.forEvent(params.id).catch(()=>({data:[]}));
      setPromos(p.data || []);
    } catch (e) {
      setMessage(getErrorMessage(e));
    }
  }

  useEffect(()=>{ load(); },[params.id]);

  const run = async (fn:()=>Promise<any>, ok:string) => {
    setMessage(""); setSuccess("");
    try { await fn(); setSuccess(ok); await load(); }
    catch(e){ setMessage(getErrorMessage(e)); }
  };

  if (!event && !message) return <Loading label="Loading event workspace..." />;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap gap-2"><span className={statusClass(event?.status)}>{event?.status}</span><span className="badge bg-slate-100 text-slate-700">{event?.currency || "BDT"}</span></div>
          <h1 className="mt-3 page-title">{event?.title || "Event"}</h1>
          <p className="mt-2 text-slate-500">{formatDate(event?.startDateTime)} · {event?.venueName || event?.venueAddress}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {["DRAFT","CHANGES_REQUESTED","REJECTED"].includes(event?.status) && <button className="btn-secondary" onClick={()=>run(()=>eventApi.submit(params.id),"Event submitted for admin review.")}>Submit for review</button>}
          {event?.status==="APPROVED" && <button className="btn-primary" onClick={()=>run(()=>eventApi.publish(params.id),"Event published or scheduled.")}>Publish</button>}
          {!["CANCELLED","COMPLETED"].includes(event?.status) && <button className="btn-danger" onClick={()=>{const reason=prompt("Cancellation reason");if(reason)run(()=>eventApi.cancel(params.id,reason),"Event cancelled.");}}>Cancel</button>}
        </div>
      </div>

      {message && <div className="mt-5"><Alert type="error">{message}</Alert></div>}
      {success && <div className="mt-5"><Alert type="success">{success}</Alert></div>}

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <div className="card">
          <h2 className="text-xl font-black">Event media</h2>
          <p className="mt-2 text-sm text-slate-500">A cover image and at least one ticket type are required before review.</p>
          {event?.coverImageUrl && <img src={event.coverImageUrl} alt="" className="mt-5 aspect-[16/7] w-full rounded-2xl object-cover" />}
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <label className="btn-secondary cursor-pointer">Upload cover<input className="hidden" type="file" accept="image/*" onChange={(e)=>{const f=e.target.files?.[0];if(f)run(()=>eventApi.uploadCover(params.id,f),"Cover image updated.");}} /></label>
            <label className="btn-secondary cursor-pointer">Add gallery images<input className="hidden" type="file" accept="image/*" multiple onChange={(e)=>{const fs=Array.from(e.target.files||[]);if(fs.length)run(()=>eventApi.uploadGallery(params.id,fs),"Gallery updated.");}} /></label>
          </div>
        </div>

        <form className="card" onSubmit={(e)=>{e.preventDefault();run(()=>ticketTypeApi.create(params.id,{
          name:ticketForm.name,description:ticketForm.description,price:Number(ticketForm.price),quantity:Number(ticketForm.quantity),maxPerOrder:Number(ticketForm.maxPerOrder),
          saleStartAt:new Date(ticketForm.saleStartAt).toISOString(),saleEndAt:new Date(ticketForm.saleEndAt).toISOString(),
          transferable:ticketForm.transferable,refundable:ticketForm.refundable,benefits:ticketForm.benefits.split("\n").filter(Boolean),isVisible:true
        }),"Ticket type created.");}}>
          <h2 className="text-xl font-black">Create ticket type</h2><p className="mt-2 text-sm text-slate-500">Prices use the event currency: <b>{event?.currency || "BDT"}</b>.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <label className="sm:col-span-2"><span className="label">Name</span><input className="input" value={ticketForm.name} onChange={(e)=>setTicketForm({...ticketForm,name:e.target.value})} required /></label>
            <label className="sm:col-span-2"><span className="label">Description</span><input className="input" value={ticketForm.description} onChange={(e)=>setTicketForm({...ticketForm,description:e.target.value})} /></label>
            <label><span className="label">Price ({event?.currency || "BDT"})</span><input className="input" type="number" min={0} value={ticketForm.price} onChange={(e)=>setTicketForm({...ticketForm,price:e.target.value})} required /></label>
            <label><span className="label">Quantity</span><input className="input" type="number" min={1} value={ticketForm.quantity} onChange={(e)=>setTicketForm({...ticketForm,quantity:e.target.value})} required /></label>
            <label><span className="label">Max per order</span><input className="input" type="number" min={1} value={ticketForm.maxPerOrder} onChange={(e)=>setTicketForm({...ticketForm,maxPerOrder:e.target.value})} /></label>
            <label><span className="label">Sales start</span><input className="input" type="datetime-local" value={ticketForm.saleStartAt} onChange={(e)=>setTicketForm({...ticketForm,saleStartAt:e.target.value})} required /></label>
            <label><span className="label">Sales end</span><input className="input" type="datetime-local" value={ticketForm.saleEndAt} onChange={(e)=>setTicketForm({...ticketForm,saleEndAt:e.target.value})} required /></label>
            <label className="sm:col-span-2"><span className="label">Benefits — one per line</span><textarea className="textarea" value={ticketForm.benefits} onChange={(e)=>setTicketForm({...ticketForm,benefits:e.target.value})} /></label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={ticketForm.transferable} onChange={(e)=>setTicketForm({...ticketForm,transferable:e.target.checked})} /> Transferable</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={ticketForm.refundable} onChange={(e)=>setTicketForm({...ticketForm,refundable:e.target.checked})} /> Refundable</label>
          </div>
          <button className="btn-primary mt-5">Create ticket type</button>
        </form>
      </div>

      <form className="card mt-6" onSubmit={(e)=>{e.preventDefault();run(()=>eventApi.update(params.id,editForm),"Event details updated.");}}>
        <h2 className="text-xl font-black">Edit event details</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <label className="sm:col-span-2"><span className="label">Short description</span><input className="input" value={editForm.shortDescription} onChange={(e)=>setEditForm({...editForm,shortDescription:e.target.value})} /></label>
          <label><span className="label">Contact phone</span><input className="input" value={editForm.contactPhone} onChange={(e)=>setEditForm({...editForm,contactPhone:e.target.value})} /></label>
          <label><span className="label">Currency</span><select className="input" value={editForm.currency} disabled={(event?.ticketTypes || []).length > 0} onChange={(e)=>setEditForm({...editForm,currency:e.target.value as "BDT" | "USD"})}><option value="BDT">BDT — Bangladeshi Taka</option><option value="USD">USD — US Dollar</option></select>{(event?.ticketTypes || []).length > 0 && <p className="mt-2 text-xs text-slate-500">Currency is locked after the first ticket type is created.</p>}</label>
        </div>
        <button className="btn-secondary mt-4">Save event details</button>
      </form>

      <div className="card mt-6">
        <h2 className="text-xl font-black">Ticket inventory</h2>
        <div className="mt-5 table-wrap">
          <table><thead><tr><th>Ticket</th><th>Price</th><th>Sold</th><th>Reserved</th><th>Capacity</th><th /></tr></thead><tbody>
            {(event?.ticketTypes || []).map((ticket:any)=><tr key={ticket.id}><td className="font-bold">{ticket.name}</td><td>{formatMoney(ticket.price, event?.currency || "BDT")}</td><td>{ticket.soldQuantity || 0}</td><td>{ticket.reservedQuantity || 0}</td><td>{ticket.quantity}</td><td><div className="flex gap-2"><button className="text-xs font-bold text-indigo-700" onClick={()=>{const value=prompt("Max tickets per order",String(ticket.maxPerOrder||1));if(value)run(()=>ticketTypeApi.update(ticket.id,{maxPerOrder:Number(value)}),"Ticket type updated.");}}>Edit</button><button className="text-xs font-bold text-rose-600" onClick={()=>run(()=>ticketTypeApi.remove(ticket.id),"Ticket type removed.")}>Delete</button></div></td></tr>)}
          </tbody></table>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <form className="card" onSubmit={(e)=>{e.preventDefault();run(()=>promoApi.create({
          eventId:params.id,code:promoForm.code.toUpperCase(),discountType:"PERCENTAGE",value:Number(promoForm.value),maxUses:Number(promoForm.maxUses),
          startAt:new Date(promoForm.startAt).toISOString(),endAt:new Date(promoForm.endAt).toISOString()
        }),"Promo code created.");}}>
          <h2 className="text-xl font-black">Promo codes</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <label><span className="label">Code</span><input className="input uppercase" value={promoForm.code} onChange={(e)=>setPromoForm({...promoForm,code:e.target.value})} required /></label>
            <label><span className="label">Discount %</span><input className="input" type="number" min={1} max={100} value={promoForm.value} onChange={(e)=>setPromoForm({...promoForm,value:e.target.value})} required /></label>
            <label><span className="label">Max uses</span><input className="input" type="number" min={1} value={promoForm.maxUses} onChange={(e)=>setPromoForm({...promoForm,maxUses:e.target.value})} required /></label>
            <label><span className="label">Starts</span><input className="input" type="datetime-local" value={promoForm.startAt} onChange={(e)=>setPromoForm({...promoForm,startAt:e.target.value})} required /></label>
            <label><span className="label">Ends</span><input className="input" type="datetime-local" value={promoForm.endAt} onChange={(e)=>setPromoForm({...promoForm,endAt:e.target.value})} required /></label>
          </div>
          <button className="btn-secondary mt-5">Create promo</button>
          <div className="mt-5 space-y-2">{promos.map((p)=><div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3" key={p.id}><span className="font-mono font-bold">{p.code}</span><button className="text-xs font-bold text-rose-600" onClick={()=>run(()=>promoApi.update(p.id,{isActive:false}),"Promo disabled.")} type="button">Disable</button></div>)}</div>
        </form>

        <div className="space-y-6">
          <form className="card" onSubmit={(e)=>{e.preventDefault();run(()=>announcementApi.send({eventId:params.id,...announcement}),"Announcement sent to attendees.");}}>
            <h2 className="text-xl font-black">Send announcement</h2>
            <input className="input mt-5" value={announcement.title} onChange={(e)=>setAnnouncement({...announcement,title:e.target.value})} placeholder="Announcement title" required />
            <textarea className="textarea mt-3" value={announcement.message} onChange={(e)=>setAnnouncement({...announcement,message:e.target.value})} placeholder="Message for ticket holders" required />
            <button className="btn-secondary mt-4">Send announcement</button>
          </form>
          <div className="card">
            <h2 className="text-xl font-black">Payout</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Payout requests become valid after the event is completed, the configured hold period has passed, and no blocking dispute remains.</p>
            <button className="btn-secondary mt-4" onClick={()=>run(()=>payoutApi.request(params.id),"Payout request created.")}>Request payout</button>
          </div>
        </div>
      </div>
    </div>
  );
}
