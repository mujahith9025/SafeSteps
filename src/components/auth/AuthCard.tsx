'use client'

import React from 'react'
import Link from 'next/link'
import { ShieldCheck, Lock } from 'lucide-react'

interface AuthCardProps {
  icon?: React.ReactNode
  title: string
  subtitle?: string
  footerPrompt?: string
  footerLinkText?: string
  footerLinkHref?: string
  trustNote?: string
  children: React.ReactNode
  className?: string
}

export function AuthCard({
  icon,
  title,
  subtitle,
  footerPrompt,
  footerLinkText,
  footerLinkHref,
  trustNote = 'We never share your health information. 256-bit clinical encryption.',
  children,
  className = '',
}: AuthCardProps) {
  return (
    <div className={`w-full max-w-[440px] bg-white rounded-2xl shadow-[0_4px_24px_-4px_rgba(13,28,46,0.06),0_1px_3px_rgba(13,28,46,0.04)] border border-slate-200/80 p-7 sm:p-9 relative flex flex-col ${className}`}>
      {/* Brand Icon Header */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-teal-700 text-white flex items-center justify-center shadow-sm mb-4 transition-transform hover:scale-105 duration-200">
          {icon || <ShieldCheck className="w-7 h-7" />}
        </div>

        <h1 className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight leading-snug">
          {title}
        </h1>

        {subtitle && (
          <p className="text-sm text-slate-600 mt-1.5 leading-relaxed max-w-sm">
            {subtitle}
          </p>
        )}
      </div>

      {/* Main Form Body */}
      <div className="w-full flex-1 flex flex-col">
        {children}
      </div>

      {/* Bottom Footer Links */}
      {footerLinkText && footerLinkHref && (
        <div className="mt-6 pt-5 border-t border-slate-100 text-center text-sm text-slate-600">
          {footerPrompt && <span className="mr-1.5">{footerPrompt}</span>}
          <Link
            href={footerLinkHref}
            className="font-semibold text-teal-700 hover:text-teal-800 hover:underline transition-colors"
          >
            {footerLinkText}
          </Link>
        </div>
      )}

      {/* Trust & Privacy Reassurance */}
      {trustNote && (
        <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-600 font-medium text-center">
          <Lock className="w-3.5 h-3.5 text-teal-700 shrink-0" />
          <span>{trustNote}</span>
        </div>
      )}
    </div>
  )
}
