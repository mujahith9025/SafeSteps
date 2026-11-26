'use client'

import React, { useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  MessageSquare,
  FileText,
  ShieldCheck,
  Clock,
  Settings,
  Plus,
  X,
} from 'lucide-react'
import { Logo } from '@/components/layout/Logo'
import { UserMenu } from './UserMenu'
import { LanguageSwitcher } from './LanguageSwitcher'
import { useTranslations } from 'next-intl'

export interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

export const NAV_ITEMS: {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}[] = [
  { label: 'Chat', href: '/chat', icon: MessageSquare },
  { label: 'My reports', href: '/reports', icon: FileText },
  { label: 'Health profile', href: '/profile', icon: ShieldCheck },
  { label: 'History', href: '/history', icon: Clock },
  { label: 'Settings', href: '/settings', icon: Settings },
]

export interface AppSidebarProps {
  user?: {
    id?: string
    name?: string | null
    email?: string | null
    avatarUrl?: string | null
  }
  isMobileOpen?: boolean
  onCloseMobile?: () => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

export function AppSidebar({
  user,
  isMobileOpen = false,
  onCloseMobile,
  isCollapsed = false,
}: AppSidebarProps) {
  const pathname = usePathname()
  const t = useTranslations('shell')
  const drawerRef = useRef<HTMLDivElement>(null)

  const navItems: NavItem[] = [
    { label: t('navChat'), href: '/chat', icon: MessageSquare },
    { label: t('navReports'), href: '/reports', icon: FileText },
    { label: t('navProfile'), href: '/profile', icon: ShieldCheck },
    { label: t('navHistory'), href: '/history', icon: Clock },
    { label: t('navSettings'), href: '/settings', icon: Settings },
  ]

  // 1. Close mobile drawer on route change
  useEffect(() => {
    if (isMobileOpen && onCloseMobile) {
      onCloseMobile()
    }
  }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  // 2. Close mobile drawer on Escape key and trap focus
  useEffect(() => {
    if (!isMobileOpen) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && onCloseMobile) {
        onCloseMobile()
        return
      }

      if (event.key === 'Tab' && drawerRef.current) {
        const focusableElements = drawerRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
        if (focusableElements.length === 0) return

        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault()
            lastElement.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault()
            firstElement.focus()
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    // Focus first element on drawer open
    const timer = setTimeout(() => {
      const focusable = drawerRef.current?.querySelector<HTMLElement>(
        'a[href], button:not([disabled])'
      )
      focusable?.focus()
    }, 50)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      clearTimeout(timer)
    }
  }, [isMobileOpen, onCloseMobile])

  const isItemActive = (href: string) => {
    if (href === '/chat') {
      return pathname === '/chat' || pathname.startsWith('/chat/')
    }
    return pathname.startsWith(href)
  }

  // --- Mobile Drawer Render ---
  if (isMobileOpen) {
    return (
      <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Mobile Navigation">
        {/* Backdrop */}
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          aria-hidden="true"
        />

        {/* Drawer Panel */}
        <div
          ref={drawerRef}
          className="fixed inset-y-0 left-0 w-[280px] bg-white flex flex-col justify-between p-4 shadow-2xl z-50 animate-in slide-in-from-left duration-250 ease-out"
        >
          <div className="flex flex-col gap-4">
            {/* Top Bar with Logo & Close button */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <Logo withWordmark={true} withTagline={false} href="/chat" />
              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="Close navigation menu"
                className="w-9 h-9 rounded-xl text-slate-500 hover:bg-slate-100 active:bg-slate-200 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-teal-700/20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* New Chat Primary Action */}
            <Link
              href="/chat"
              onClick={onCloseMobile}
              className="w-full h-12 bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>{t('newChat')}</span>
            </Link>

            {/* Navigation Links */}
            <nav className="flex flex-col gap-1.5" aria-label="Mobile Main Navigation">
              {navItems.map((item) => {
                const active = isItemActive(item.href)
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onCloseMobile}
                    aria-current={active ? 'page' : undefined}
                    className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-colors ${
                      active
                        ? 'bg-teal-50 text-teal-900 font-semibold border-l-4 border-teal-700'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-teal-700' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="flex flex-col gap-3 pt-3 border-t border-slate-100">
            {/* Mobile Language Switcher Row */}
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold text-slate-500">{t('languageSwitcherLabel')}</span>
              <LanguageSwitcher />
            </div>

            {/* User Menu at Bottom */}
            <UserMenu user={user} isCollapsed={false} />
          </div>
        </div>
      </div>
    )
  }

  // --- Collapsed Tablet Sidebar (md:flex lg:hidden) ---
  if (isCollapsed) {
    return (
      <aside
        className="w-[76px] shrink-0 bg-white border-r border-slate-200/80 flex flex-col items-center justify-between py-5 px-2 select-none z-30"
        aria-label="Sidebar Navigation"
      >
        <div className="flex flex-col items-center w-full gap-4">
          {/* Logo icon */}
          <div className="p-1">
            <Logo withWordmark={false} withTagline={false} href="/chat" />
          </div>

          {/* Teal + New chat button */}
          <Link
            href="/chat"
            aria-label="New chat consultation"
            title={t('newChat')}
            className="w-12 h-12 rounded-xl bg-teal-700 hover:bg-teal-800 text-white flex items-center justify-center shadow-sm transition-colors group relative focus:outline-none focus:ring-2 focus:ring-teal-700/30"
          >
            <Plus className="w-5 h-5" />
            <div className="absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-md z-50">
              {t('newChat')}
            </div>
          </Link>

          <div className="w-8 h-px bg-slate-200 my-1" />

          {/* Icon-only nav */}
          <nav className="flex flex-col items-center gap-2 w-full" aria-label="Tablet Sidebar Navigation">
            {navItems.map((item) => {
              const active = isItemActive(item.href)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-label={item.label}
                  aria-current={active ? 'page' : undefined}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center relative group transition-colors focus:outline-none focus:ring-2 focus:ring-teal-700/20 ${
                    active
                      ? 'bg-teal-50 text-teal-800'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${active ? 'text-teal-700' : 'text-slate-500'}`} />
                  {active && (
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-teal-700 ring-2 ring-white" />
                  )}
                  {/* Tooltip */}
                  <div className="absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-md z-50">
                    {item.label}
                  </div>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Collapsed User Avatar at bottom */}
        <div className="pt-4 border-t border-slate-100 w-full flex justify-center">
          <UserMenu user={user} isCollapsed={true} />
        </div>
      </aside>
    )
  }

  // --- Expanded Desktop Sidebar (lg:flex, w-[260px]) ---
  return (
    <aside
      className="w-[260px] shrink-0 bg-white border-r border-slate-200/80 flex flex-col justify-between p-4 select-none z-30"
      aria-label="Desktop Sidebar Navigation"
    >
      <div className="flex flex-col gap-4">
        {/* Brand Logo */}
        <div className="px-1 py-1">
          <Logo withWordmark={true} withTagline={false} href="/chat" />
        </div>

        {/* Teal New Chat Primary CTA */}
        <Link
          href="/chat"
          className="w-full h-12 bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-teal-700/30"
        >
          <Plus className="w-5 h-5" />
          <span>{t('newChat')}</span>
        </Link>

        {/* Navigation items */}
        <nav className="flex flex-col gap-1 mt-1" aria-label="Desktop Main Navigation">
          {navItems.map((item) => {
            const active = isItemActive(item.href)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                  active
                    ? 'bg-teal-50 text-teal-900 font-semibold border-l-4 border-teal-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-teal-700' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* User profile with initials & menu at bottom */}
      <div className="pt-3 border-t border-slate-100">
        <UserMenu user={user} isCollapsed={false} />
      </div>
    </aside>
  )
}
