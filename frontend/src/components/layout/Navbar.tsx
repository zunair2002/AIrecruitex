"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { handleNavClick } from "./smoothScroll";

const navLinks = [
  { href: "#how-it-works", label: "How It Works", isPage: false },
  { href: "#features", label: "Features", isPage: false },
  { href: "/about", label: "About", isPage: true },
  { href: "/pricing", label: "Pricing", isPage: true },
  { href: "/contact", label: "Contact", isPage: true },
] as const;

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group z-50">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md transform group-hover:scale-105 transition-transform">
              <svg
                viewBox="0 0 24 24"
                width="24"
                height="24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15 6C15 6 9 6 9 10C9 12 12 12 12 12C12 12 15 12 15 14C15 18 9 18 9 18"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent tracking-tight">
              Skreena
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-6 bg-white/50 backdrop-blur-sm px-6 py-2.5 rounded-full border border-gray-200/50 shadow-sm">
            {navLinks.map((link) =>
              link.isPage ? (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-semibold text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="text-sm font-semibold text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  {link.label}
                </a>
              ),
            )}
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/login/candidate"
              className="px-5 py-2.5 text-sm rounded-full font-semibold text-gray-700 bg-white border border-gray-200 hover:border-indigo-300 hover:text-indigo-600 transition-all"
            >
              Candidate Login
            </Link>
            <Link
              href="/login/recruiter"
              className="px-5 py-2.5 text-sm rounded-full font-bold bg-gray-900 text-white hover:bg-indigo-600 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Recruiter Login
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors z-50"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menu"
          >
            {!isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 w-full bg-white shadow-xl border-t border-gray-100 lg:hidden"
          >
            <div className="container mx-auto px-4 py-6 flex flex-col gap-4">
              {navLinks.map((link) =>
                link.isPage ? (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-lg font-semibold text-gray-800 hover:text-indigo-600 p-2 rounded-lg hover:bg-gray-50"
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
                    className="text-lg font-semibold text-gray-800 hover:text-indigo-600 p-2 rounded-lg hover:bg-gray-50"
                  >
                    {link.label}
                  </a>
                ),
              )}
              <hr className="border-gray-100 my-2" />
              <div className="flex flex-col gap-3 pt-2">
                <Link
                  href="/login/candidate"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-3 text-center rounded-xl font-bold text-gray-700 bg-gray-50 border border-gray-200"
                >
                  Candidate Login
                </Link>
                <Link
                  href="/login/recruiter"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-3 text-center rounded-xl font-bold text-white bg-indigo-600 shadow-md"
                >
                  Recruiter Login
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
