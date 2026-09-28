"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert } from "@/components/Alert";
import { Loading } from "@/components/Loading";
import { getErrorMessage } from "@/lib/api";
import { orderApi } from "@/lib/services";
import { formatDate, formatMoney, statusClass } from "@/lib/format";

export default function OrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState("");
  const [paymentState, setPaymentState] = useState("");

  useEffect(() => {
    setPaymentState(new URLSearchParams(location.search).get("payment") || "");
    orderApi.details(params.id)
      .then((r:any)=>setOrder(r.data))
      .catch((e)=>setError(getErrorMessage(e)));
  }, [params.id]);

  if (!order && !error) return <Loading label="Loading order..." />;

  return (
    <div>
      <h1 className="page-title">Order details</h1>
      {paymentState === "success" && <div className="mt-5"><Alert type="success">Payment returned successfully. EventFlow verified the invoice server-side before finalizing your tickets.</Alert></div>}
      {error && <div className="mt-5"><Alert type="error">{error}</Alert></div>}
      {order && (
        <>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <div className="card"><p className="text-xs text-slate-400">Order</p><p className="mt-2 font-mono text-sm font-bold">{order.orderNumber || order.id}</p></div>
            <div className="card"><p className="text-xs text-slate-400">Status</p><p className="mt-2"><span className={statusClass(order.status)}>{order.status}</span></p></div>
            <div className="card"><p className="text-xs text-slate-400">Total</p><p className="mt-2 text-xl font-black">{formatMoney(order.total ?? order.totalAmount ?? order.amount ?? 0)}</p></div>
            <div className="card"><p className="text-xs text-slate-400">Created</p><p className="mt-2 text-sm font-bold">{formatDate(order.createdAt)}</p></div>
          </div>

          <div className="card mt-6">
            <h2 className="text-xl font-black">{order.event?.title || "Event order"}</h2>
            <div className="mt-5 table-wrap">
              <table>
                <thead><tr><th>Ticket type</th><th>Quantity</th><th>Unit price</th></tr></thead>
                <tbody>{(order.items || []).map((item:any)=>(
                  <tr key={item.id}><td>{item.ticketTypeName || item.ticketType?.name || item.name || "Ticket"}</td><td>{item.quantity}</td><td>{formatMoney(item.unitPrice ?? item.price)}</td></tr>
                ))}</tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
