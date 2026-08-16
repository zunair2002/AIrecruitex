"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

export function NavbarWrapper() {
  const pathname = usePathname();

  if (pathname?.startsWith("/login") || pathname?.startsWith("/candidate") || pathname?.startsWith("/recruiter")) {
    return null;
  }

  return <Navbar />;
}
