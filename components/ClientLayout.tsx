"use client";

import { ThemeProvider } from "@/contexts/ThemeContext";
import Navbar from "@/components/Navbar";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <Navbar />
      {children}
    </ThemeProvider>
  );
}