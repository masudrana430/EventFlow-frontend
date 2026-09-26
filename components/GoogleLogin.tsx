"use client";

import { useEffect, useRef } from "react";
import { authApi } from "@/lib/services";
import { saveSession } from "@/lib/auth";

declare global {
  interface Window {
    google?: any;
  }
}

export function GoogleLogin() {
  const ref = useRef<HTMLDivElement>(null);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId || !ref.current) return;
    const initialize = () => {
      if (!window.google || !ref.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: { credential: string }) => {
          const result: any = await authApi.google(response.credential);
          if (result?.data?.accessToken) {
            saveSession(result.data);
            location.href = "/dashboard";
          }
        },
      });
      window.google.accounts.id.renderButton(ref.current, {
        theme: "outline",
        size: "large",
        width: 360,
        text: "continue_with",
      });
    };

    if (window.google) {
      initialize();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initialize;
    document.head.appendChild(script);
    return () => script.remove();
  }, [clientId]);

  if (!clientId) return null;
  return <div ref={ref} className="mt-4 flex justify-center" />;
}
