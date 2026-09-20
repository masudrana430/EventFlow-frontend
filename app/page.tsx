import Link from "next/link";
import { ArrowRight, CalendarDays, QrCode, TicketCheck } from "lucide-react";
const features = [
  ["Discover Events", "Browse upcoming events.", CalendarDays],
  ["Digital Tickets", "Keep tickets and QR codes ready.", TicketCheck],
  ["Smart Check-in", "Validate tickets quickly.", QrCode],
] as const;

export default function Home() {
  return <main>
    <section className="border-b bg-white"><div className="container-page grid gap-10 py-20 lg:grid-cols-2">
      <div><span className="rounded-full bg-slate-100 px-3 py-1 text-sm">Event management, ticketing & check-in</span><h1 className="mt-6 text-5xl font-black">Run better events with EventFlow.</h1><p className="mt-6 text-lg text-slate-600">For attendees, organizers, event staff and administrators.</p><div className="mt-8 flex gap-3"><Link href="/events" className="btn-primary gap-2">Browse events<ArrowRight className="h-4 w-4"/></Link><Link href="/register" className="btn-secondary">Create account</Link></div></div>
      <div className="card bg-slate-900 text-white"><p className="text-sm uppercase tracking-widest text-slate-400">Built for</p><div className="mt-6 grid grid-cols-2 gap-4">{["Attendees","Organizers","Event Staff","Admins"].map(x => <div key={x} className="rounded-xl border border-white/10 bg-white/5 p-5 font-semibold">{x}</div>)}</div></div>
    </div></section>
    <section className="container-page grid gap-6 py-16 md:grid-cols-3">{features.map(([t,d,I]) => <article key={t} className="card"><I className="h-8 w-8"/><h2 className="mt-5 text-xl font-bold">{t}</h2><p className="mt-2 text-slate-600">{d}</p></article>)}</section>
  </main>;
}
