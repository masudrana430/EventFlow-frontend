"use client";

import { useEffect, useState } from "react";
import { Alert } from "@/components/Alert";
import { EmptyState, Loading } from "@/components/Loading";
import { getErrorMessage } from "@/lib/api";
import { getLocalUser } from "@/lib/auth";
import { disputeApi, payoutApi, refundApi } from "@/lib/services";
import { formatDate, formatMoney, statusClass } from "@/lib/format";

export default function FinancePage(){
  const user=typeof window!=="undefined"?getLocalUser():null;
  const isAdmin=user?.role==="ADMIN"||user?.role==="SUPER_ADMIN";
  const [refunds,setRefunds]=useState<any[]>([]);
  const [payouts,setPayouts]=useState<any[]>([]);
  const [disputes,setDisputes]=useState<any[]>([]);
  const [message,setMessage]=useState("");
  const [success,setSuccess]=useState("");
  const [loading,setLoading]=useState(true);

  async function load(){
    setLoading(true);
    try{
      const [r,p,d]:any[]=await Promise.all([
        isAdmin?refundApi.all():refundApi.organizer(),
        isAdmin?payoutApi.all():payoutApi.mine(),
        isAdmin?Promise.resolve({data:[]}):disputeApi.organizer(),
      ]);
      setRefunds(r.data||[]);
      setPayouts(p.data||[]);
      setDisputes(d.data||[]);
    }catch(e){setMessage(getErrorMessage(e));}
    finally{setLoading(false);}
  }
  useEffect(()=>{if(user)load();},[user?.role]);

  const run=async(fn:()=>Promise<any>,ok:string)=>{
    setMessage("");setSuccess("");
    try{await fn();setSuccess(ok);await load();}catch(e){setMessage(getErrorMessage(e));}
  };

  if(loading)return <Loading label="Loading finance queues..."/>;

  return (
    <div>
      <h1 className="page-title">Refunds & payouts</h1>
      <p className="mt-2 text-slate-500">{isAdmin?"Process platform finance queues and payout states.":"Review attendee refund requests and track organizer payouts."}</p>
      {message&&<div className="mt-5"><Alert type="error">{message}</Alert></div>}
      {success&&<div className="mt-5"><Alert type="success">{success}</Alert></div>}

      <section className="mt-8">
        <h2 className="text-xl font-black">Refund queue</h2>
        {!refunds.length?<div className="mt-4"><EmptyState title="No refunds in queue" description="Eligible attendee refund requests will appear here."/></div>:(
          <div className="mt-4 table-wrap">
            <table><thead><tr><th>Event / ticket</th><th>Amount</th><th>Reason</th><th>Status</th><th>Requested</th><th>Actions</th></tr></thead><tbody>
              {refunds.map((refund)=><tr key={refund.id}>
                <td><p className="font-bold">{refund.ticket?.event?.title||refund.event?.title||"Refund"}</p><p className="mt-1 font-mono text-xs text-slate-400">{refund.ticketId}</p></td>
                <td>{formatMoney(refund.amount||refund.refundAmount)}</td>
                <td className="max-w-xs text-slate-500">{refund.reason}</td>
                <td><span className={statusClass(refund.status)}>{refund.status}</span></td>
                <td>{formatDate(refund.createdAt)}</td>
                <td>
                  {!isAdmin&&refund.status==="REQUESTED"&&<div className="flex gap-2"><button className="text-xs font-bold text-emerald-700" onClick={()=>run(()=>refundApi.decide(refund.id,{decision:"APPROVED"}),"Refund approved for processing.")}>Approve</button><button className="text-xs font-bold text-rose-600" onClick={()=>{const reason=prompt("Rejection reason");if(reason)run(()=>refundApi.decide(refund.id,{decision:"REJECTED",reason}),"Refund rejected.");}}>Reject</button></div>}
                  {isAdmin&&["APPROVED","PROCESSING"].includes(refund.status)&&<button className="text-xs font-bold text-indigo-700" onClick={()=>{const ref=prompt("Gateway refund reference");if(ref)run(()=>refundApi.complete(refund.id,ref),"Refund recorded as complete.");}}>Complete</button>}
                </td>
              </tr>)}
            </tbody></table>
          </div>
        )}
      </section>

      {!isAdmin && <section className="mt-10">
        <h2 className="text-xl font-black">Organizer disputes</h2>
        {!disputes.length?<div className="mt-4"><EmptyState title="No disputes" description="Attendee disputes for your events will appear here."/></div>:(
          <div className="mt-4 space-y-3">
            {disputes.map((d)=><div className="card" key={d.id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div><div className="flex items-center gap-2"><p className="font-bold">{d.reason}</p><span className={statusClass(d.status)}>{d.status}</span></div><p className="mt-2 text-sm text-slate-500">{d.description}</p></div>
                {!d.organizerResponse&&<button className="btn-secondary !py-2" onClick={()=>{const response=prompt("Organizer response");if(response)run(()=>disputeApi.respond(d.id,response),"Dispute response submitted.");}}>Respond</button>}
              </div>
            </div>)}
          </div>
        )}
      </section>}

      <section className="mt-10">
        <h2 className="text-xl font-black">Payouts</h2>
        {!payouts.length?<div className="mt-4"><EmptyState title="No payouts yet" description="Eligible event payout requests will appear here after completion and hold requirements."/></div>:(
          <div className="mt-4 table-wrap">
            <table><thead><tr><th>Event</th><th>Amount</th><th>Status</th><th>Reference</th><th>Updated</th>{isAdmin&&<th>Actions</th>}</tr></thead><tbody>
              {payouts.map((payout)=><tr key={payout.id}>
                <td className="font-bold">{payout.event?.title||payout.eventId||"Event payout"}</td>
                <td>{formatMoney(payout.amount||payout.netAmount)}</td>
                <td><span className={statusClass(payout.status)}>{payout.status}</span></td>
                <td className="font-mono text-xs">{payout.paymentReference||"—"}</td>
                <td>{formatDate(payout.updatedAt||payout.createdAt)}</td>
                {isAdmin&&<td><div className="flex flex-wrap gap-2">
                  {["PENDING","ELIGIBLE"].includes(payout.status)&&<button className="text-xs font-bold text-indigo-700" onClick={()=>run(()=>payoutApi.updateStatus(payout.id,{status:"PROCESSING"}),"Payout moved to processing.")}>Process</button>}
                  {payout.status==="PROCESSING"&&<button className="text-xs font-bold text-emerald-700" onClick={()=>{const ref=prompt("Payment reference");if(ref)run(()=>payoutApi.updateStatus(payout.id,{status:"PAID",paymentReference:ref}),"Payout marked paid.");}}>Mark paid</button>}
                  {!["PAID","CANCELLED"].includes(payout.status)&&<button className="text-xs font-bold text-amber-700" onClick={()=>{const reason=prompt("Hold reason");if(reason)run(()=>payoutApi.updateStatus(payout.id,{status:"HELD",holdReason:reason}),"Payout placed on hold.");}}>Hold</button>}
                </div></td>}
              </tr>)}
            </tbody></table>
          </div>
        )}
      </section>
    </div>
  );
}
