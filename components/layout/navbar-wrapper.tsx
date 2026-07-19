"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";

export function NavbarWrapper() {
  const pathname = usePathname();

  // Route yang TIDAK akan menampilkan Navbar
  const hiddenRoutes = ["/", "/login", "/register"];

  if (hiddenRoutes.includes(pathname)) {
    return null;
  }

  return <Navbar />;
}