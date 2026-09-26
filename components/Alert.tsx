"use client";

export function Alert({
  type = "info",
  children,
}: {
  type?: "info" | "success" | "error" | "warning";
  children: React.ReactNode;
}) {
  const styles = {
    info: "border-indigo-200 bg-indigo-50 text-indigo-800",
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    error: "border-rose-200 bg-rose-50 text-rose-800",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
  };
  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm ${styles[type]}`}>
      {children}
    </div>
  );
}
