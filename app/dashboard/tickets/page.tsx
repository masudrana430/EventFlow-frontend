"use client";

import { Download, TicketCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Alert } from "@/components/Alert";
import { EmptyState, Loading } from "@/components/Loading";
import { getErrorMessage } from "@/lib/api";
import { ticketApi } from "@/lib/services";
import { formatDate, formatMoney, statusClass } from "@/lib/format";

export default function TicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ticketApi.mine().then((r:any)=>setTickets(r.data || [])).catch((e)=>setError(getErrorMessage(e))).finally(()=>setLoading(false));
  }, []);

  async function download(id: string) {
    try {
      const response = await ticketApi.downloadPdf(id);
      const url = URL.createObjectURL(response.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `eventflow-ticket-${id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(getErrorMessage(e, "Could not download ticket"));
    }
  }

  return (
    <div>
      <h1 className="page-title">Digital tickets</h1>
      <p className="mt-2 text-slate-500">Your active EventFlow tickets, QR payloads and downloadable PDFs.</p>
      {error && <div className="mt-5"><Alert type="error">{error}</Alert></div>}
      {loading ? <Loading /> : !tickets.length ? <div className="mt-8"><EmptyState title="No tickets yet" description="Paid or free confirmed orders will generate digital tickets here." /></div> : (
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {tickets.map((ticket)=>{
            const currency = ticket.order?.currency || ticket.event?.currency || "BDT";
            const price = Number(ticket.ticketType?.price ?? 0);
            return (
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white" key={ticket.id}>
                <div className="bg-slate-950 p-6 text-white">
                  <div className="flex items-start justify-between gap-4">
                    <div><p className="text-xs font-bold uppercase tracking-[.18em] text-indigo-300">EventFlow ticket</p><h2 className="mt-2 text-xl font-black">{ticket.event?.title || "Event ticket"}</h2></div>
                    <TicketCheck className="h-7 w-7 text-indigo-300" />
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold">{ticket.ticketType?.name || "Admission"}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="badge">{currency}</span>
                        <span className="text-sm font-bold text-slate-700">{price === 0 ? "Free" : formatMoney(price, currency)}</span>
                      </div>
                    </div>
                    <span className={statusClass(ticket.status)}>{ticket.status}</span>
                  </div>
                  <p className="mt-3 text-sm text-slate-500">{formatDate(ticket.event?.startDateTime)}</p>
                  <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">QR payload</p>
                    <p className="mt-2 break-all font-mono text-xs text-slate-600">{ticket.qrPayload || "Generated ticket payload"}</p>
                  </div>
                  <button onClick={()=>download(ticket.id)} className="btn-secondary mt-5 w-full"><Download className="h-4 w-4" /> Download PDF</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
