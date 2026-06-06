"use client";

import React from "react";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="w-full flex flex-col h-dvh max-sm:h-auto max-sm:min-h-[100dvh] bg-background overflow-hidden max-sm:overflow-visible pt-4 relative">
      {children}
    </main>
  );
}
