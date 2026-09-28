"use client";

import { useEffect, useState } from "react";
import { Alert } from "@/components/Alert";
import { EmptyState, Loading } from "@/components/Loading";
import { getErrorMessage } from "@/lib/api";
import {
  adminApi,
  categoryApi,
  disputeApi,
  eventApi,
  orderApi,
  organizerApi,
  reviewApi,
} from "@/lib/services";
import { formatDate, formatMoney, statusClass } from "@/lib/format";

type Tab = "applications"|"events"|"categories"|"users"|"payments"|"disputes"|"platform";

export default function AdminCenterPage(){
  const [tab,setTab]=useState<Tab>("applications");
  const [data,setData]=useState<any[]>([]);
  const [settings,setSettings]=useState<any[]>([]);
  const [logs,setLogs]=useState<any[]>([]);
  const [loading,setLoading]=useState(false);
  const [message,setMessage]=useState("");
  const [success,setSuccess]=useState("");
  const [category,setCategory]=useState({name:"",description:""});
  const [account,setAccount]=useState({name:"",email:"",personalEmail:"",role:"ADMIN"});
  const [setting,setSetting]=useState({key:"ticketing",description:"Ticketing configuration",value:'{"enabled":true}'});
  const [review,setReview]=useState({id:"",status:"HIDDEN"});

  async function load(next:Tab=tab){
    setLoading(true);setMessage("");
    try{
      if(next==="applications"){const r:any=await organizerApi.applications();setData(r.data||[]);}
      if(next==="events"){const r:any=await eventApi.adminList();setData(r.data||[]);}
      if(next==="categories"){const r:any=await categoryApi.all();setData(r.data||[]);}
      if(next==="users"){const r:any=await adminApi.users({page:1,limit:100});setData(r.data||[]);}
      if(next==="payments"){const r:any=await orderApi.allPayments();setData(r.data||[]);}
      if(next==="disputes"){const r:any=await disputeApi.admin();setData(r.data||[]);}
      if(next==="platform"){
        const [s,a]:any[]=await Promise.all([adminApi.settings(),adminApi.auditLogs({page:1,limit:50})]);
        setSettings(s.data||[]);setLogs(a.data||[]);
      }
    }catch(e){setMessage(getErrorMessage(e));}
    finally{setLoading(false);}
  }

  useEffect(()=>{load(tab);},[tab]);

  const run=async(fn:()=>Promise<any>,ok:string)=>{
    setMessage("");setSuccess("");
    try{await fn();setSuccess(ok);await load(tab);}catch(e){setMessage(getErrorMessage(e));}
  };

  const tabs:Tab[]=["applications","events","categories","users","payments","disputes","platform"];

  return (
    <div>
      <h1 className="page-title">Admin center</h1>
      <p className="mt-2 text-slate-500">Review organizers and events, manage platform entities, finance visibility, disputes and audit operations.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {tabs.map((value)=><button key={value} onClick={()=>setTab(value)} className={tab===value?"btn-primary !py-2":"btn-secondary !py-2"}>{value[0].toUpperCase()+value.slice(1)}</button>)}
      </div>

      {message&&<div className="mt-5"><Alert type="error">{message}</Alert></div>}
      {success&&<div className="mt-5"><Alert type="success">{success}</Alert></div>}
      {loading&&<Loading label="Loading admin data..."/>}

      {!loading&&tab==="applications"&&(
        <div className="mt-8 space-y-4">
          {!data.length?<EmptyState title="No organizer applications" description="New verified organizer applications will appear here."/>:data.map((item)=>(
            <div className="card" key={item.id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2"><h2 className="text-lg font-black">{item.organizationName}</h2><span className={statusClass(item.approvalStatus)}>{item.approvalStatus}</span></div>
                  <p className="mt-1 text-sm text-slate-500">{item.user?.name} · {item.user?.email}</p>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{item.experience}</p>
                </div>
                {item.approvalStatus==="PENDING"&&<div className="flex gap-2"><button className="btn-primary !py-2" onClick={()=>run(()=>organizerApi.decide(item.id,{status:"APPROVED"}),"Organizer approved.")}>Approve</button><button className="btn-danger !py-2" onClick={()=>{const reason=prompt("Rejection reason");if(reason)run(()=>organizerApi.decide(item.id,{status:"REJECTED",rejectionReason:reason}),"Organizer rejected.");}}>Reject</button></div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading&&tab==="events"&&(
        <div className="mt-8 table-wrap">
          <table><thead><tr><th>Event</th><th>Organizer</th><th>Status</th><th>Starts</th><th>Actions</th></tr></thead><tbody>
            {data.map((event)=><tr key={event.id}>
              <td><p className="font-bold">{event.title}</p><p className="mt-1 text-xs text-slate-400">{event.venueName||event.venueAddress}</p></td>
              <td>{event.organizer?.organizationName||event.organizer?.user?.name||"—"}</td>
              <td><span className={statusClass(event.status)}>{event.status}</span></td>
              <td>{formatDate(event.startDateTime)}</td>
              <td><div className="flex flex-wrap gap-2">
                {event.status==="PENDING_REVIEW"&&<><button className="text-xs font-bold text-emerald-700" onClick={()=>run(()=>eventApi.review(event.id,{decision:"APPROVED"}),"Event approved.")}>Approve</button><button className="text-xs font-bold text-amber-700" onClick={()=>{const reason=prompt("Requested changes");if(reason)run(()=>eventApi.review(event.id,{decision:"CHANGES_REQUESTED",reason}),"Changes requested.");}}>Request changes</button><button className="text-xs font-bold text-rose-600" onClick={()=>{const reason=prompt("Rejection reason");if(reason)run(()=>eventApi.review(event.id,{decision:"REJECTED",reason}),"Event rejected.");}}>Reject</button></>}
                {event.status==="PUBLISHED"&&<button className="text-xs font-bold text-rose-600" onClick={()=>{const reason=prompt("Suspension reason");if(reason)run(()=>eventApi.suspend(event.id,reason),"Event suspended.");}}>Suspend</button>}
                {event.status==="SUSPENDED"&&<button className="text-xs font-bold text-emerald-700" onClick={()=>run(()=>eventApi.restore(event.id),"Event restored.")}>Restore</button>}
              </div></td>
            </tr>)}
          </tbody></table>
        </div>
      )}

      {!loading&&tab==="categories"&&(
        <div className="mt-8 grid gap-6 xl:grid-cols-[.7fr_1.3fr]">
          <form className="card" onSubmit={(e)=>{e.preventDefault();run(()=>categoryApi.create(category),"Category created.");}}>
            <h2 className="text-xl font-black">Create category</h2>
            <input className="input mt-5" value={category.name} onChange={(e)=>setCategory({...category,name:e.target.value})} placeholder="Category name" required/>
            <textarea className="textarea mt-3" value={category.description} onChange={(e)=>setCategory({...category,description:e.target.value})} placeholder="Description"/>
            <button className="btn-primary mt-4">Create category</button>
          </form>
          <div className="table-wrap"><table><thead><tr><th>Name</th><th>Description</th><th>Actions</th></tr></thead><tbody>{data.map((c)=><tr key={c.id}><td className="font-bold">{c.name}</td><td className="text-slate-500">{c.description}</td><td><div className="flex gap-2"><button className="text-xs font-bold text-indigo-700" onClick={()=>{const d=prompt("New description",c.description||"");if(d!==null)run(()=>categoryApi.update(c.id,{description:d}),"Category updated.");}}>Edit</button><button className="text-xs font-bold text-rose-600" onClick={()=>confirm("Delete this category?")&&run(()=>categoryApi.remove(c.id),"Category removed.")}>Delete</button></div></td></tr>)}</tbody></table></div>
        </div>
      )}

      {!loading&&tab==="users"&&(
        <div className="mt-8 table-wrap"><table><thead><tr><th>User</th><th>Role</th><th>Status</th><th>Verified</th><th>Actions</th></tr></thead><tbody>{data.map((u)=><tr key={u.id}><td><p className="font-bold">{u.name}</p><p className="text-xs text-slate-500">{u.email}</p></td><td>{u.role}</td><td><span className={statusClass(u.status)}>{u.status}</span></td><td>{u.isEmailVerified?"Yes":"No"}</td><td>{u.status==="BLOCKED"?<button className="text-xs font-bold text-emerald-700" onClick={()=>run(()=>adminApi.setUserStatus(u.id,"ACTIVE"),"User activated.")}>Activate</button>:<button className="text-xs font-bold text-rose-600" onClick={()=>run(()=>adminApi.setUserStatus(u.id,"BLOCKED"),"User blocked.")}>Block</button>}</td></tr>)}</tbody></table></div>
      )}

      {!loading&&tab==="payments"&&(
        <div className="mt-8 table-wrap"><table><thead><tr><th>Invoice</th><th>User/order</th><th>Amount</th><th>Status</th><th>Created</th></tr></thead><tbody>{data.map((p)=><tr key={p.id}><td className="font-mono text-xs">{p.invoiceId||p.id}</td><td>{p.order?.orderNumber||p.orderId||"—"}</td><td>{formatMoney(p.amount, p.currency || p.order?.currency || "BDT")}</td><td><span className={statusClass(p.status)}>{p.status}</span></td><td>{formatDate(p.createdAt)}</td></tr>)}</tbody></table></div>
      )}

      {!loading&&tab==="disputes"&&(
        <div className="mt-8 space-y-4">
          {!data.length?<EmptyState title="No disputes" description="Attendee disputes requiring admin action will appear here."/>:data.map((d)=>(
            <div className="card" key={d.id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div><div className="flex items-center gap-2"><h2 className="font-black">{d.reason}</h2><span className={statusClass(d.status)}>{d.status}</span></div><p className="mt-2 max-w-2xl text-sm text-slate-500">{d.description}</p>{d.organizerResponse&&<p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm"><b>Organizer:</b> {d.organizerResponse}</p>}</div>
                {!["RESOLVED","REJECTED"].includes(d.status)&&<div className="flex flex-wrap gap-2"><button className="btn-secondary !py-2" onClick={()=>run(()=>disputeApi.decide(d.id,{decision:"REJECT",note:"Reviewed by EventFlow admin"}),"Dispute rejected.")}>Reject</button><button className="btn-primary !py-2" onClick={()=>run(()=>disputeApi.decide(d.id,{decision:"FULL_REFUND",note:"Full refund approved"}),"Full refund decision recorded.")}>Full refund</button></div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading&&tab==="platform"&&(
        <div className="mt-8 space-y-8">
          <div className="grid gap-6 xl:grid-cols-2">
            <form className="card" onSubmit={(e)=>{e.preventDefault();run(()=>adminApi.createAccount(account),"Administrative account created and credentials emailed.");}}>
              <h2 className="text-xl font-black">Create admin account</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <input className="input sm:col-span-2" placeholder="Name" value={account.name} onChange={(e)=>setAccount({...account,name:e.target.value})} required/>
                <input className="input sm:col-span-2" type="email" placeholder="Organization email" value={account.email} onChange={(e)=>setAccount({...account,email:e.target.value})} required/>
                <input className="input sm:col-span-2" type="email" placeholder="Personal delivery email" value={account.personalEmail} onChange={(e)=>setAccount({...account,personalEmail:e.target.value})} required/>
                <select className="input" value={account.role} onChange={(e)=>setAccount({...account,role:e.target.value})}><option>ADMIN</option><option>SUPER_ADMIN</option></select>
              </div>
              <button className="btn-primary mt-4">Create account</button>
            </form>

            <form className="card" onSubmit={(e)=>{e.preventDefault();let value:any;try{value=JSON.parse(setting.value);}catch{return setMessage("Setting value must be valid JSON.");}run(()=>adminApi.upsertSetting(setting.key,{value,description:setting.description}),"Platform setting saved.");}}>
              <h2 className="text-xl font-black">Platform setting</h2>
              <input className="input mt-5" placeholder="Key" value={setting.key} onChange={(e)=>setSetting({...setting,key:e.target.value})} required/>
              <input className="input mt-3" placeholder="Description" value={setting.description} onChange={(e)=>setSetting({...setting,description:e.target.value})}/>
              <textarea className="textarea mt-3 font-mono text-xs" value={setting.value} onChange={(e)=>setSetting({...setting,value:e.target.value})}/>
              <button className="btn-secondary mt-4">Save setting</button>
            </form>
          </div>

          <div className="card">
            <h2 className="text-xl font-black">Review moderation</h2>
            <p className="mt-2 text-sm text-slate-500">Use a review ID from an event's public review list to hide or restore it.</p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row"><input className="input" placeholder="Review ID" value={review.id} onChange={(e)=>setReview({...review,id:e.target.value})}/><select className="input sm:max-w-44" value={review.status} onChange={(e)=>setReview({...review,status:e.target.value})}><option>HIDDEN</option><option>VISIBLE</option></select><button className="btn-secondary" onClick={()=>run(()=>reviewApi.moderate(review.id,review.status as any),"Review moderation updated.")}>Apply</button></div>
          </div>

          <div>
            <h2 className="text-xl font-black">Current settings</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">{settings.map((s)=><div className="card" key={s.id||s.key}><p className="font-bold">{s.key}</p><pre className="mt-2 overflow-auto text-xs text-slate-500">{JSON.stringify(s.value,null,2)}</pre></div>)}</div>
          </div>

          <div>
            <h2 className="text-xl font-black">Recent audit logs</h2>
            <div className="mt-4 table-wrap"><table><thead><tr><th>Action</th><th>Target</th><th>Actor</th><th>Time</th></tr></thead><tbody>{logs.map((log)=><tr key={log.id}><td className="font-bold">{log.action}</td><td>{log.targetType} {log.targetId}</td><td>{log.actor?.email||log.actorUserId||"System"}</td><td>{formatDate(log.createdAt)}</td></tr>)}</tbody></table></div>
          </div>
        </div>
      )}
    </div>
  );
}
