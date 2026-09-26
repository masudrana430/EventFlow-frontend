"use client";

import { useEffect, useState } from "react";
import { Alert } from "@/components/Alert";
import { EmptyState, Loading } from "@/components/Loading";
import { getErrorMessage } from "@/lib/api";
import { eventApi, staffApi } from "@/lib/services";
import { formatDate, statusClass } from "@/lib/format";

export default function StaffManagementPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [form, setForm] = useState({ name:"", email:"", eventId:"" });
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  async function load(){
    setLoading(true);
    try{
      const [s,e]:any[]=await Promise.all([staffApi.list(),eventApi.mine()]);
      setStaff(s.data||[]);
      setEvents(e.data||[]);
    }catch(e){setMessage(getErrorMessage(e));}
    finally{setLoading(false);}
  }
  useEffect(()=>{load();},[]);

  const run=async(fn:()=>Promise<any>,ok:string)=>{
    setMessage("");setSuccess("");
    try{const r:any=await fn();setSuccess(ok+(r?.data?.temporaryPassword?" Temporary password generated; the staff member also receives it by email.":""));await load();}
    catch(e){setMessage(getErrorMessage(e));}
  };

  return (
    <div>
      <h1 className="page-title">Event staff</h1>
      <p className="mt-2 text-slate-500">Invite staff, control event assignments and revoke access.</p>
      {message&&<div className="mt-5"><Alert type="error">{message}</Alert></div>}
      {success&&<div className="mt-5"><Alert type="success">{success}</Alert></div>}

      <div className="mt-8 grid gap-6 xl:grid-cols-[.8fr_1.2fr]">
        <form className="card" onSubmit={(e)=>{e.preventDefault();run(()=>staffApi.invite({name:form.name,email:form.email,eventIds:[form.eventId]}),"Staff invitation created.");}}>
          <h2 className="text-xl font-black">Invite event staff</h2>
          <div className="mt-5 space-y-4">
            <label><span className="label">Name</span><input className="input" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} required /></label>
            <label><span className="label">Email</span><input className="input" type="email" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} required /></label>
            <label><span className="label">Event assignment</span><select className="input" value={form.eventId} onChange={(e)=>setForm({...form,eventId:e.target.value})} required><option value="">Select event</option>{events.map((event)=><option key={event.id} value={event.id}>{event.title}</option>)}</select></label>
          </div>
          <button className="btn-primary mt-5">Send invitation</button>
        </form>

        <div>
          {loading?<Loading/>:!staff.length?<EmptyState title="No staff invited" description="Invite gate staff or event operators and assign them to events."/>:(
            <div className="space-y-4">
              {staff.map((member)=>(
                <div className="card" key={member.id}>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2"><h3 className="font-black">{member.user?.name||member.name||"Event staff"}</h3><span className={statusClass(member.invitationStatus)}>{member.invitationStatus}</span></div>
                      <p className="mt-1 text-sm text-slate-500">{member.user?.email||member.email}</p>
                      {member.invitationExpiresAt&&<p className="mt-2 text-xs text-slate-400">Invitation expires {formatDate(member.invitationExpiresAt)}</p>}
                    </div>
                    <button className="btn-danger !py-2" onClick={()=>run(()=>staffApi.revoke(member.id),"Staff access revoked.")}>Revoke</button>
                  </div>
                  <div className="mt-4">
                    <span className="label">Assign to event</span>
                    <div className="flex gap-2">
                      <select id={`assign-${member.id}`} className="input">
                        <option value="">Choose event</option>{events.map((event)=><option value={event.id} key={event.id}>{event.title}</option>)}
                      </select>
                      <button className="btn-secondary" onClick={()=>{const el=document.getElementById(`assign-${member.id}`) as HTMLSelectElement|null;if(el?.value)run(()=>staffApi.assign(member.id,[el.value]),"Assignment updated.");}}>Assign</button>
                    </div>
                  </div>
                  {!!member.assignments?.length&&<div className="mt-4 flex flex-wrap gap-2">{member.assignments.map((a:any)=><span className="badge" key={a.id||a.eventId}>{a.event?.title||a.eventId}</span>)}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
