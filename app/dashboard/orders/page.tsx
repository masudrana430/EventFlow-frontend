"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Alert } from "@/components/Alert";
import { EmptyState, Loading } from "@/components/Loading";
import { getErrorMessage } from "@/lib/api";
import { orderApi } from "@/lib/services";
import { formatDate, formatMoney, statusClass } from "@/lib/format";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([orderApi.mine(), orderApi.myPayments()])
      .then(([o,p]: any[]) => {
        setOrders(Array.isArray(o.data) ? o.data : []);
        setPayments(Array.isArray(p.data) ? p.data : []);
      })
      .catch((e)=>setError(getErrorMessage(e)))
      .finally(()=>setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="page-title">Orders & payments</h1>
      <p className="mt-2 text-slate-500">Track ticket orders and verified payment activity.</p>
      {error && <div className="mt-5"><Alert type="error">{error}</Alert></div>}
      {loading ? <Loading /> : orders.length === 0 ? <div className="mt-8"><EmptyState title="No orders yet" description="Browse a published event and reserve your first ticket." /></div> : (
        <div className="mt-8 table-wrap">
          <table>
            <thead><tr><th>Order</th><th>Event</th><th>Total</th><th>Status</th><th>Created</th><th /></tr></thead>
            <tbody>{orders.map((order)=>(
              <tr key={order.id}>
                <td className="font-mono text-xs">{order.orderNumber || order.id}</td>
                <td className="font-semibold">{order.event?.title || "Event order"}</td>
                <td>{formatMoney(order.totalAmount ?? order.amount ?? 0)}</td>
                <td><span className={statusClass(order.status)}>{order.status}</span></td>
                <td>{formatDate(order.createdAt)}</td>
                <td><Link className="font-bold text-indigo-700" href={`/dashboard/orders/${order.id}`}>View</Link></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}

      <div className="mt-10">
        <h2 className="text-xl font-black">Payment history</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {payments.map((payment)=>(
            <div className="card" key={payment.id}>
              <div className="flex items-center justify-between"><p className="font-bold">{formatMoney(payment.amount)}</p><span className={statusClass(payment.status)}>{payment.status}</span></div>
              <p className="mt-2 font-mono text-xs text-slate-500">{payment.invoiceId || payment.id}</p>
              <p className="mt-2 text-xs text-slate-400">{formatDate(payment.createdAt)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
