import { ReactNode } from "react";
import { TopRail } from "./TopRail";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen pb-16">
      <TopRail />
      <main className="mx-auto max-w-[1440px] px-4 pt-[20px] sm:px-7 sm:pt-[26px]">
        {children}
      </main>
    </div>
  );
}
