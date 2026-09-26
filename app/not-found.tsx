import Link from "next/link";

export default function NotFound(){
  return <main className="container-page flex min-h-[60vh] items-center justify-center py-16">
    <div className="card max-w-xl text-center">
      <p className="text-sm font-bold uppercase tracking-[.2em] text-indigo-600">404</p>
      <h1 className="mt-3 text-4xl font-black">That page is not on the guest list.</h1>
      <p className="mt-4 text-slate-500">Return to EventFlow or browse currently published events.</p>
      <div className="mt-6 flex justify-center gap-3"><Link className="btn-primary" href="/">Home</Link><Link className="btn-secondary" href="/events">Browse events</Link></div>
    </div>
  </main>;
}
