import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { DisclaimerBanner, Navbar, Footer } from "@/components/layout";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SafeSteps | Understand your symptoms. Know your next step.",
  description:
    "SafeSteps is a calm, kind AI health guidance assistant helping you understand symptoms and make informed decisions on care urgency.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} font-sans h-full`}>
      <body className="min-h-full antialiased bg-background text-text-main flex flex-col">
        {/* Skip to Main Content Link for Keyboard and Screen Reader Accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-primary focus:text-white focus:rounded-xl focus:shadow-md focus:font-semibold focus:text-sm"
        >
          Skip to main content
        </a>
        <DisclaimerBanner />
        <Suspense fallback={null}>
          <Navbar />
        </Suspense>
        <main id="main-content" className="flex-1 flex flex-col">
          {children}
        </main>
        <Suspense fallback={null}>
          <Footer />
        </Suspense>
      </body>
    </html>
  );
}
