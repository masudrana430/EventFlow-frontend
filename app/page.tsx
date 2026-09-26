import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  CalendarDays,
  CreditCard,
  QrCode,
  ShieldCheck,
  TicketCheck,
  Users,
} from "lucide-react";

const capabilities = [
  { title: "Event discovery", copy: "Search published events by category, location and keyword.", icon: CalendarDays },
  { title: "Digital ticketing", copy: "Buy tickets, store QR codes, download PDFs and manage transfers.", icon: TicketCheck },
  { title: "Secure checkout", copy: "Complete paid orders through UddoktaPay with server-side verification.", icon: CreditCard },
  { title: "Fast check-in", copy: "Event staff can scan QR tickets or perform controlled manual check-in.", icon: QrCode },
  { title: "Organizer operations", copy: "Manage events, inventory, promos, staff, announcements, refunds and payouts.", icon: Users },
  { title: "Platform controls", copy: "Admin moderation, disputes, audit logs, users, payments and analytics.", icon: ShieldCheck },
];

export default function Home() {
  return (
    <main>
      <section className="overflow-hidden border-b border-slate-200 bg-white">
        <div className="container-page grid items-center gap-14 py-20 lg:grid-cols-[1.05fr_.95fr] lg:py-28">
          <div>
            <span className="badge bg-indigo-100 text-indigo-700">Complete event operations platform</span>
            <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[1.03] tracking-tight sm:text-6xl">
              Discover memorable events. Run them with confidence.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              EventFlow connects attendees, organizers, event staff and administrators with ticketing, payments, check-in and operational tools.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/events" className="btn-primary">
                Browse events <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/apply-organizer" className="btn-secondary">Become an organizer</Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-5 text-sm text-slate-500">
              <span className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-emerald-600" /> Verified organizer workflow</span>
              <span className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-emerald-600" /> UddoktaPay checkout</span>
              <span className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-emerald-600" /> Role-based dashboards</span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-12 rounded-full bg-indigo-200/40 blur-3xl" />
            <div className="relative rounded-[2rem] bg-slate-950 p-6 text-white shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[.2em] text-indigo-300">Event operations</p>
                  <h2 className="mt-2 text-2xl font-black">One workflow, every role</h2>
                </div>
                <BarChart3 className="h-8 w-8 text-indigo-300" />
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {[
                  ["Attendees", "Orders, tickets, refunds, transfers"],
                  ["Organizers", "Events, staff, payouts, announcements"],
                  ["Event staff", "Assignments and secure check-in"],
                  ["Admins", "Moderation, disputes, analytics"],
                ].map(([title, copy]) => (
                  <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <p className="font-bold">{title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{copy}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[.18em] text-indigo-600">Built end to end</p>
          <h2 className="mt-3 section-title">Everything an event needs after the idea.</h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {capabilities.map(({ title, copy, icon: Icon }) => (
            <article className="card" key={title}>
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-50 text-indigo-700">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-lg font-black">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{copy}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
