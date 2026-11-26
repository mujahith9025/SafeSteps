'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  User as UserIcon,
  Settings as SettingsIcon,
  LogOut,
  ChevronUp,
  ShieldCheck,
} from 'lucide-react'
import { logoutAction } from '@/app/(auth)/actions'
import { useTranslations } from 'next-intl'

export interface UserMenuProps {
  user?: {
    id?: string
    name?: string | null
    email?: string | null
    avatarUrl?: string | null
  }
  isCollapsed?: boolean
  className?: string
}

function getInitials(name?: string | null, email?: string | null): string {
  if (name && name.trim().length > 0) {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    }
    return parts[0].substring(0, 2).toUpperCase()
  }
  if (email && email.trim().length > 0) {
    return email.trim().substring(0, 2).toUpperCase()
  }
  return 'AP'
}

export function UserMenu({ user, isCollapsed = false, className = '' }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const t = useTranslations('shell')

  const displayName = user?.name?.trim() || 'Ananya Patel'
  const displayEmail = user?.email?.trim() || 'ananya.patel@healthnet.nhs.uk'
  const initials = getInitials(user?.name, user?.email)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <div ref={menuRef} className={`relative ${className}`}>
      {/* Trigger */}
      {isCollapsed ? (
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-haspopup="menu"
          aria-expanded={isOpen}
          aria-label={`User menu for ${displayName}`}
          className="relative w-11 h-11 rounded-full bg-teal-100 hover:bg-teal-200 text-teal-800 font-semibold text-xs flex items-center justify-center transition-colors shadow-2xs group focus:outline-none focus:ring-2 focus:ring-teal-700/30"
        >
          <span>{initials}</span>
          <span
            className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-teal-700 ring-2 ring-white"
            aria-hidden="true"
          />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-haspopup="menu"
          aria-expanded={isOpen}
          aria-label={`User menu for ${displayName}`}
          className="w-full p-2 rounded-xl hover:bg-slate-100 active:bg-slate-200 transition-colors flex items-center justify-between text-left group focus:outline-none focus:ring-2 focus:ring-teal-700/20"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-9 h-9 rounded-full bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center shrink-0">
              {initials}
              <span
                className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-teal-700 ring-2 ring-white"
                aria-hidden="true"
              />
            </div>
            <div className="min-w-0 flex flex-col">
              <span className="font-semibold text-xs text-slate-900 truncate">
                {displayName}
              </span>
              <span className="text-[11px] text-slate-500 truncate">{displayEmail}</span>
            </div>
          </div>
          <ChevronUp
            className={`w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
      )}

      {/* Popover Menu */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className={`absolute bottom-full mb-2 ${
            isCollapsed ? 'left-full ml-2 w-64' : 'left-0 right-0'
          } bg-white rounded-2xl shadow-xl border border-slate-200/90 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100`}
        >
          {/* Header Card */}
          <div className="px-3 py-2.5 bg-slate-50 rounded-xl mb-1 border border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-teal-700" />
                Verified Patient
              </span>
              <span className="text-[10px] text-slate-400">DPDP Protected</span>
            </div>
            <div className="font-semibold text-xs text-slate-900 mt-1 truncate">
              {displayName}
            </div>
            <div className="text-[11px] text-slate-500 truncate">{displayEmail}</div>
          </div>

          {/* Links */}
          <div className="py-1 space-y-0.5">
            <Link
              href="/profile"
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-2.5 transition-colors font-medium"
            >
              <UserIcon className="w-4 h-4 text-slate-500" />
              <span>{t('userMenuProfile')}</span>
            </Link>

            <Link
              href="/settings"
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-2.5 transition-colors font-medium"
            >
              <SettingsIcon className="w-4 h-4 text-slate-500" />
              <span>{t('userMenuSettings')}</span>
            </Link>
          </div>

          <div className="border-t border-slate-100 my-1" />

          {/* Log out Action */}
          <form action={logoutAction} className="w-full">
            <button
              type="submit"
              role="menuitem"
              className="w-full px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg flex items-center gap-2.5 font-medium transition-colors"
            >
              <LogOut className="w-4 h-4 text-red-500" />
              <span>{t('userMenuLogOut')}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
