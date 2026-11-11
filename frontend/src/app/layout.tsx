import type { Metadata } from "next";
import { Raleway } from "next/font/google";
import "./globals.css";
import { NavbarWrapper } from "@/components/layout/NavbarWrapper";
import { AuthProvider } from "@/context/AuthContext";
import { RealtimeProvider } from "@/context/RealtimeContext";
import { ToastProvider } from "@/context/ToastContext";
import { RealtimeToasts } from "@/components/shared/RealtimeToasts";

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-raleway",
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
    <html lang="en" className={raleway.variable}>
      <body className={`${raleway.className} antialiased`}>
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
