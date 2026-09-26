"use client";

import { Bell, CheckCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Alert } from "@/components/Alert";
import { EmptyState, Loading } from "@/components/Loading";
import { getErrorMessage } from "@/lib/api";
import { notificationApi } from "@/lib/services";
import { formatDate } from "@/lib/format";

export default function NotificationsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    try {
      const response: any = await notificationApi.mine();
      setItems(response.data || []);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function markAll() {
    await notificationApi.readAll();
    await load();
  }

  async function markOne(id: string) {
    await notificationApi.read(id);
    await load();
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><h1 className="page-title">Notifications</h1><p className="mt-2 text-slate-500">Account, ticket and event activity from EventFlow.</p></div>
        <button className="btn-secondary" onClick={markAll}><CheckCheck className="h-4 w-4" /> Mark all read</button>
      </div>
      {error && <div className="mt-5"><Alert type="error">{error}</Alert></div>}
      {loading ? <Loading /> : !items.length ? <div className="mt-8"><EmptyState title="You're all caught up" description="New EventFlow activity will appear here." /></div> : (
        <div className="mt-8 space-y-3">
          {items.map((item) => (
            <button onClick={() => !item.isRead && markOne(item.id)} key={item.id} className={`w-full rounded-2xl border p-5 text-left ${item.isRead ? "border-slate-200 bg-white" : "border-indigo-200 bg-indigo-50"}`}>
              <div className="flex gap-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-indigo-700"><Bell className="h-4 w-4" /></span>
                <div className="min-w-0">
                  <p className="font-bold">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">{item.message}</p>
                  <p className="mt-2 text-xs text-slate-400">{formatDate(item.createdAt)}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
