"use client";

import { useState } from "react";
import Link from "next/link";

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="nav-logo-icon">
              <svg
                viewBox="0 0 48 48"
                width="40"
                height="40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient
                    id="navLogoGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" style={{ stopColor: "#6366f1" }} />
                    <stop offset="100%" style={{ stopColor: "#8b5cf6" }} />
                  </linearGradient>
                </defs>
                <rect
                  width="48"
                  height="48"
                  rx="12"
                  fill="url(#navLogoGradient)"
                />
                <path
                  d="M30 12C30 12 18 12 18 20C18 24 24 24 24 24C24 24 30 24 30 28C30 36 18 36 18 36"
                  stroke="white"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Skreena
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-8">
            <a
              href="#how-it-works"
              className="text-gray-600 hover:text-indigo-600 transition-colors font-medium"
            >
              How It Works
            </a>
            <a
              href="#features"
              className="text-gray-600 hover:text-indigo-600 transition-colors font-medium"
            >
              Features
            </a>
            <a
              href="#recruitment-service"
              className="text-gray-600 hover:text-indigo-600 transition-colors font-medium"
            >
              Services
            </a>
            <a
              href="#contact"
              className="text-gray-600 hover:text-indigo-600 transition-colors font-medium"
            >
              Contact
            </a>
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href="/portal/"
              className="px-5 py-2.5 text-sm rounded-xl font-semibold text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200"
            >
              Candidate Login
            </a>
            <a
              href="/partner"
              className="px-5 py-2.5 text-sm rounded-xl font-semibold text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200"
            >
              Partner Login
            </a>
            <a
              href="#contact"
              className="px-5 py-2.5 text-sm rounded-xl font-semibold text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200"
            >
              Book a Demo
            </a>
            <a
              href="/recruiter"
              className="px-5 py-2.5 text-sm rounded-xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-200"
            >
              Recruiter Login
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menu"
          >
            {!isMobileMenuOpen ? (
              <svg
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col space-y-3">
              <a
                href="#how-it-works"
                className="px-3 py-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                How It Works
              </a>
              <a
                href="#features"
                className="px-3 py-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                Features
              </a>
              <a
                href="#recruitment-service"
                className="px-3 py-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                Services
              </a>
              <a
                href="#contact"
                className="px-3 py-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                Contact
              </a>
              <div className="pt-3 space-y-2">
                <a
                  href="/portal/"
                  className="block px-3 py-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  Candidate Login
                </a>
                <a
                  href="/partner"
                  className="block px-3 py-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  Partner Login
                </a>
                <a
                  href="#contact"
                  className="block px-3 py-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  Book a Demo
                </a>
                <a
                  href="/recruiter"
                  className="block px-3 py-2 text-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
                >
                  Recruiter Login
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

// Make sure the component is exported as default as well (for safety)
export default Navbar;
