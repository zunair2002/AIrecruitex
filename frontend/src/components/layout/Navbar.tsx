"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { handleNavClick } from "./smoothScroll";
import { BrandWordmark } from "./Logo";

const navLinks = [
  { href: "#how-it-works", label: "How it works", isPage: false },
  { href: "#features", label: "Platform", isPage: false },
  { href: "/about", label: "About", isPage: true },
  { href: "/pricing", label: "Pricing", isPage: true },
  { href: "/contact", label: "Contact", isPage: true },
] as const;

const linkClass =
  "text-[13px] font-medium tracking-wide text-zinc-600 transition-colors hover:text-brand";

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 right-0 left-0 z-50 border-t-[3px] border-t-brand border-b border-[#e0d6ea] bg-white">
      <div className="mx-auto flex h-[4.75rem] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="z-50 transition-opacity hover:opacity-80">
          <BrandWordmark className="text-[1.65rem]" />
        </Link>

        <div className="hidden items-center gap-9 lg:flex">
          {navLinks.map((link) =>
            link.isPage ? (
              <Link key={link.href} href={link.href} className={linkClass}>
                {link.label}
              </Link>
            ) : (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={linkClass}
              >
                {link.label}
              </a>
            ),
          )}
        </div>

        <div className="hidden items-center gap-6 lg:flex">
          <Link
            href="/login/candidate"
            className="text-[13px] font-medium text-zinc-600 transition-colors hover:text-brand"
          >
            Candidate
          </Link>
          <Link
            href="/login/recruiter"
            className="rounded-sm bg-brand px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            Recruiter login
          </Link>
        </div>

        <button
          className="z-50 rounded-sm p-2 text-ink hover:bg-zinc-100 lg:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Menu"
        >
          {!isMobileMenuOpen ? (
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-full left-0 w-full border-b border-[#e0d6ea] bg-white lg:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-5">
              {navLinks.map((link) =>
                link.isPage ? (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-2 py-3 text-base text-ink"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(e) =>
                      handleNavClick(e, link.href, () => setIsMobileMenuOpen(false))
                    }
                    className="px-2 py-3 text-base text-ink"
                  >
                    {link.label}
                  </a>
                ),
              )}
              <div className="mt-3 flex flex-col gap-2 border-t border-[#e0d6ea] pt-4">
                <Link
                  href="/login/candidate"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="border border-[#e0d6ea] py-3 text-center text-sm font-semibold text-ink"
                >
                  Candidate login
                </Link>
                <Link
                  href="/login/recruiter"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="bg-brand py-3 text-center text-sm font-semibold text-white"
                >
                  Recruiter login
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
