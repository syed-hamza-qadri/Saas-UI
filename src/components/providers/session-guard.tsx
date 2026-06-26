"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAppSettings } from "@/components/providers/settings-provider";
import toast from "react-hot-toast";

export function SessionGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const appSettings = useAppSettings();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const timeoutMs = (appSettings.sessionTimeout ?? 30) * 60 * 1000;

    const reset = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        toast("Session expired. Please sign in again.", { icon: "🔒" });
        router.push("/login");
      }, timeoutMs);
    };

    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [appSettings.sessionTimeout, router]);

  return <>{children}</>;
}
