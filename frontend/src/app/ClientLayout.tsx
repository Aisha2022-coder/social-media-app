"use client";

import Navbar from "@/components/Navbar";
import { usePathname } from "next/navigation";
import { ToastProvider } from "@/components/Toast";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showNavbar = pathname !== "/login" && pathname !== "/signup";

  return (
    <ToastProvider>
      {showNavbar && <Navbar />}
      {children}
    </ToastProvider>
  );
} 