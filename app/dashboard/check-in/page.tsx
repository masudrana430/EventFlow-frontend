"use client";

import { QrCode, Search, TicketCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Alert } from "@/components/Alert";
import { EmptyState, Loading } from "@/components/Loading";
import { getErrorMessage } from "@/lib/api";
import { staffApi, ticketApi } from "@/lib/services";
import { formatDate, statusClass } from "@/lib/format";

export default function CheckInPage(){
  const [assignments,setAssignments]=useState<any[]>([]);
  const [eventId,setEventId]=useState("");
  const [qrPayload,setQrPayload]=useState("");
  const [search,setSearch]=useState("");
  const [results,setResults]=useState<any[]>([]);
  const [message,setMessage]=useState("");
  const [success,setSuccess]=useState("");
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    staffApi.assignments().then((r:any)=>{
      const data=r.data||[];
      setAssignments(data);
      const first=data[0]?.eventId||data[0]?.event?.id;
      if(first)setEventId(first);
    }).catch((e)=>setMessage(getErrorMessage(e))).finally(()=>setLoading(false));
  },[]);

  const run=async(fn:()=>Promise<any>,ok:string)=>{
    setMessage("");setSuccess("");
    try{await fn();setSuccess(ok);}catch(e){setMessage(getErrorMessage(e));}
  };

  async function doSearch(e:React.FormEvent){
    e.preventDefault();setMessage("");
    try{const r:any=await ticketApi.search(eventId,search);setResults(r.data||[]);}
    catch(e){setMessage(getErrorMessage(e));}
  }

  if(loading)return <Loading label="Loading staff assignments..."/>;

  return (
    <div>
      <h1 className="page-title">Ticket check-in</h1>
      <p className="mt-2 text-slate-500">Validate QR tickets or search attendees for controlled manual entry.</p>
      {message&&<div className="mt-5"><Alert type="error">{message}</Alert></div>}
      {success&&<div className="mt-5"><Alert type="success">{success}</Alert></div>}

      {!assignments.length?<div className="mt-8"><EmptyState title="No active event assignments" description="An organizer must assign your staff account to an event before check-in is available."/></div>:(
        <>
          <div className="card mt-8">
            <label><span className="label">Active event</span><select className="input max-w-xl" value={eventId} onChange={(e)=>setEventId(e.target.value)}>{assignments.map((a)=>{const event=a.event||a;return <option key={a.id||event.id} value={a.eventId||event.id}>{event.title||"Assigned event"} — {formatDate(event.startDateTime)}</option>})}</select></label>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <form className="card" onSubmit={(e)=>{e.preventDefault();run(()=>ticketApi.qrCheckIn({eventId,qrPayload}),"Ticket checked in successfully.");}}>
              <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-700"><QrCode className="h-5 w-5"/></span><h2 className="text-xl font-black">QR check-in</h2></div>
              <p className="mt-3 text-sm leading-6 text-slate-500">Paste the signed QR payload from the attendee's digital ticket. EventFlow validates the event, status and entry window.</p>
              <textarea className="textarea mt-5 min-h-36 font-mono text-xs" value={qrPayload} onChange={(e)=>setQrPayload(e.target.value.trim())} placeholder="Paste QR payload" required/>
              <button className="btn-primary mt-4"><TicketCheck className="h-4 w-4"/> Check in ticket</button>
            </form>

            <form className="card" onSubmit={doSearch}>
              <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-700"><Search className="h-5 w-5"/></span><h2 className="text-xl font-black">Manual search</h2></div>
              <p className="mt-3 text-sm leading-6 text-slate-500">Search by attendee email or ticket reference, then confirm a manual check-in.</p>
              <div className="mt-5 flex gap-2"><input className="input" value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Attendee email or ticket" required/><button className="btn-secondary">Search</button></div>
            </form>
          </div>

          {!!results.length&&<div className="mt-6 table-wrap"><table><thead><tr><th>Ticket</th><th>Attendee</th><th>Status</th><th/></tr></thead><tbody>{results.map((ticket)=><tr key={ticket.id}><td>{ticket.ticketType?.name||ticket.id}</td><td>{ticket.owner?.user?.email||ticket.owner?.user?.name||"Attendee"}</td><td><span className={statusClass(ticket.status)}>{ticket.status}</span></td><td><button className="font-bold text-indigo-700" onClick={()=>run(()=>ticketApi.manualCheckIn({eventId,ticketId:ticket.id,confirm:true}),"Manual check-in completed.")}>Check in</button></td></tr>)}</tbody></table></div>}
        </>
      )}
    </div>
  );
}
