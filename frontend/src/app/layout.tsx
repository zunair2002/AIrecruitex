import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { NavbarWrapper } from "@/components/layout/NavbarWrapper";
import { AuthProvider } from "@/context/AuthContext";
import { RealtimeProvider } from "@/context/RealtimeContext";
import { ToastProvider } from "@/context/ToastContext";
import { RealtimeToasts } from "@/components/shared/RealtimeToasts";

/** UI and body copy. Variable font, so every weight is available. */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

/**
 * Display face: page titles, headings, KPI numbers and the wordmark
 * (`font-display`). Variable font covering 500–800.
 */
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AiRecruitex — AI-Powered Recruitment Platform",
  description: "Your shortlist, ready by morning",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // data-scroll-behavior lets Next turn smooth scrolling off during route
    // changes, so a new page starts at the top instead of animating there.
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${jakarta.variable}`}
    >
      <body className="bg-canvas font-sans text-body antialiased">
        <AuthProvider>
          <RealtimeProvider>
            <ToastProvider>
              <RealtimeToasts />
              <NavbarWrapper />
              {children}
            </ToastProvider>
          </RealtimeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
