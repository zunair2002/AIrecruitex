"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

/**
 * Routes that render their own chrome and must never get the marketing navbar.
 *
 * Each portal brings its own sidebar, so a second header on top of it is always
 * wrong. Keep this list as the single source of truth: it is the thing that
 * gets forgotten when a new portal is added — /admin was missing from it, which
 * is why the admin screens were sitting under the public nav.
 */
const CHROME_FREE_PREFIXES = [
  "/candidate",
  "/recruiter",
  "/admin",
  "/login",
  "/register",
  "/account-deactivated",
];

export function NavbarWrapper() {
  const pathname = usePathname();

  const isChromeFree = CHROME_FREE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname?.startsWith(`${prefix}/`),
  );

  if (isChromeFree) return null;

  return <Navbar />;
}
