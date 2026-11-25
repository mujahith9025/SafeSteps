import React from "react";
import Link from "next/link";

interface LogoProps {
  withWordmark?: boolean;
  withTagline?: boolean;
  className?: string;
  href?: string;
  tabIndex?: number;
}

export function Logo({
  withWordmark = true,
  withTagline = true,
  className = "",
  href = "/",
  tabIndex,
}: LogoProps) {
  const content = (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Shield Icon with dual footsteps */}
      <svg
        viewBox="0 0 60 60"
        className="h-9 w-9 shrink-0 drop-shadow-2xs"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect width="60" height="60" rx="18" fill="#0F766E" />
        {/* Footstep 1 (Left, slightly lower, mint) */}
        <g transform="translate(14, 15) scale(0.9)" fill="#CCFBF1">
          <ellipse cx="6" cy="22" rx="3.5" ry="4" />
          <path d="M2.5,14 C2,10 3,6 7,5.5 C10.5,5 12,8 11.5,13 C11,16.5 8,17.5 5,17 C3.5,16.5 2.8,15.5 2.5,14 Z" />
          <circle cx="8" cy="2.5" r="1.5" />
          <circle cx="11.5" cy="3.5" r="1.2" />
          <circle cx="5" cy="3.5" r="1.1" />
        </g>
        {/* Footstep 2 (Right, slightly higher forward, white) */}
        <g transform="translate(26, 10) scale(0.9)" fill="#FFFFFF">
          <ellipse cx="6" cy="22" rx="3.5" ry="4" />
          <path d="M2.5,14 C2,10 3,6 7,5.5 C10.5,5 12,8 11.5,13 C11,16.5 8,17.5 5,17 C3.5,16.5 2.8,15.5 2.5,14 Z" />
          <circle cx="8" cy="2.5" r="1.5" />
          <circle cx="11.5" cy="3.5" r="1.2" />
          <circle cx="5" cy="3.5" r="1.1" />
        </g>
      </svg>

      {/* Wordmark */}
      {withWordmark && (
        <div className="flex flex-col leading-none">
          <span className="text-[20px] font-bold tracking-tight text-text-main font-sans">
            Safe<span className="text-primary">Steps</span>
          </span>
          {withTagline && (
            <span className="text-[9.5px] font-semibold tracking-widest uppercase text-text-muted mt-0.5">
              Health Guidance Assistant
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} aria-label="SafeSteps Home" className="inline-flex" tabIndex={tabIndex}>
        {content}
      </Link>
    );
  }

  return content;
}
