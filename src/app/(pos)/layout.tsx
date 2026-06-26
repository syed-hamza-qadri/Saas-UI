import React from "react";
import { SessionGuard } from "@/components/providers/session-guard";

export default function PosLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionGuard>
      {children}
    </SessionGuard>
  );
}
