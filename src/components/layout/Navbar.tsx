"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, PhoneCall, MessageSquareText } from "lucide-react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Close mobile menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // On emergency page: minimal header with only logo, no marketing navbar
  if (pathname === "/emergency") {
    return (
      <header className="sticky top-0 z-40 w-full bg-surface/95 backdrop-blur-xl border-b border-border shadow-xs">
        <div className="max-w-[1120px] mx-auto h-16 px-4 sm:px-6 flex items-center justify-between">
          <Logo href="/" tabIndex={-1} />
        </div>
      </header>
    );
  }

  const navLinks = [
    { label: "How it works", href: "/#how-it-works" },
    { label: "Safety", href: "/#safety" },
    { label: "Urgency Levels", href: "/#urgency-levels" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-surface/95 backdrop-blur-xl border-b border-border shadow-xs">
      <div className="max-w-[1120px] mx-auto h-20 px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left: Brand Logo */}
        <div className="shrink-0">
          <Logo href="/" />
        </div>

        {/* Center: Desktop Navigation Links */}
        <nav
          aria-label="Main Navigation"
          className="hidden md:flex items-center gap-8"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-body text-text-muted hover:text-text-main hover:text-primary transition-colors font-medium"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right: Action Buttons (Desktop & Mobile) */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Always-visible Red Emergency Help Button */}
          <Button
            variant="emergency"
            size="sm"
            href="/emergency"
            aria-label="Emergency Help: Call 112 or open emergency guidance"
            className="h-10 min-h-[44px] px-3.5 sm:px-4 text-caption font-semibold"
          >
            <PhoneCall className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="hidden xs:inline">Emergency Help</span>
            <span className="xs:hidden">112</span>
            <span className="hidden sm:inline">(112)</span>
          </Button>

          {/* Desktop Primary CTA: Start Chat */}
          <div className="hidden sm:block">
            <Button
              variant="primary"
              size="sm"
              href="/chat"
              className="h-10 min-h-[44px] px-5 text-caption font-semibold"
            >
              <MessageSquareText className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Start Chat</span>
            </Button>
          </div>

          {/* Mobile Hamburger Trigger */}
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isOpen}
            aria-controls="mobile-nav"
            className="md:hidden h-11 w-11 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-text-main hover:bg-slate-100 active:bg-slate-200 transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
          >
            {isOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Accessible Mobile Drawer / Dropdown */}
      {isOpen && (
        <div
          ref={mobileMenuRef}
          id="mobile-nav"
          className="md:hidden border-t border-border bg-surface px-5 py-6 shadow-md animate-fade-in"
        >
          <nav aria-label="Mobile Navigation" className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-body font-medium text-text-main hover:text-primary py-2 px-3 rounded-lg hover:bg-background transition-colors"
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-4 border-t border-border flex flex-col gap-3">
              <Button
                variant="primary"
                href="/chat"
                className="w-full justify-center h-12"
                onClick={() => setIsOpen(false)}
              >
                <MessageSquareText className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Start Symptom Chat</span>
              </Button>

              <Button
                variant="emergency"
                href="/emergency"
                className="w-full justify-center h-12"
                onClick={() => setIsOpen(false)}
              >
                <PhoneCall className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Emergency Help (112)</span>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
