import { ReactNode } from "react";
import { Shell } from "@/components/dashboard/Shell";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <Shell>{children}</Shell>;
}
