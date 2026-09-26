import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-slate-200 bg-white">
      <div className="container-page grid gap-10 py-12 md:grid-cols-3">
        <div>
          <div className="text-xl font-black">Event<span className="text-indigo-600">Flow</span></div>
          <p className="mt-3 max-w-sm text-sm leading-6 text-slate-500">
            Event discovery, ticketing, secure payments, organizer operations and fast check-in in one platform.
          </p>
        </div>
        <div>
          <p className="font-semibold">Explore</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-slate-500">
            <Link href="/events">Upcoming events</Link>
            <Link href="/apply-organizer">Become an organizer</Link>
            <Link href="/login">Sign in</Link>
          </div>
        </div>
        <div>
          <p className="font-semibold">Platform</p>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Powered by the EventFlow API with digital tickets, UddoktaPay checkout, refunds, transfers, waitlists and analytics.
          </p>
        </div>
      </div>
      <div className="border-t border-slate-100 py-5 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} EventFlow.
      </div>
    </footer>
  );
}
