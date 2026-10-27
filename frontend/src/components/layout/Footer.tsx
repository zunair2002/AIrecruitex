"use client";

import Link from "next/link";
import { handleNavClick } from "./smoothScroll";
import { LogoMark } from "./Logo";

export const Footer = () => {
  return (
    <footer className="bg-navy py-16 text-[#b8c2d9]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-5 lg:col-span-2">
            <Link href="/" className="flex items-center gap-3">
              <LogoMark className="h-8 w-8" rounded="rounded-sm bg-white/10" />
              <span className="font-display text-2xl text-white">
                AiRecruitex
              </span>
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-[#9aa6c2]">
              AI interviews around the clock. Ranked shortlists by morning. Hire
              with a brief, not a guess.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="mb-1 text-sm font-semibold text-white">Product</h4>
            <Link href="/about" className="text-sm text-[#9aa6c2] hover:text-white">
              About
            </Link>
            <a
              href="#how-it-works"
              onClick={(e) => handleNavClick(e, "#how-it-works")}
              className="text-sm text-[#9aa6c2] hover:text-white"
            >
              How it works
            </a>
            <Link href="/pricing" className="text-sm text-[#9aa6c2] hover:text-white">
              Pricing
            </Link>
            <Link href="/contact" className="text-sm text-[#9aa6c2] hover:text-white">
              Contact
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="mb-1 text-sm font-semibold text-white">Legal</h4>
            <Link href="/privacy" className="text-sm text-[#9aa6c2] hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-[#9aa6c2] hover:text-white">
              Terms of Service
            </Link>
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-8 md:flex-row md:items-center">
          <p className="text-sm text-[#7d8aa8]">
            &copy; {new Date().getFullYear()} AiRecruitex. All rights reserved.
          </p>
          <p className="text-xs font-medium tracking-[0.16em] text-[#9aa6c2] uppercase">
            Screen with evidence
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
