import React from 'react'

export default function ProfileLoading() {
  return (
    <div
      className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6 animate-pulse"
      role="status"
      aria-label="Loading health profile"
    >
      <div className="h-6 w-40 bg-teal-100 rounded-full" />
      <div className="h-8 w-64 bg-slate-200 rounded-xl" />
      <div className="h-4 w-96 bg-slate-100 rounded-lg" />
      <div className="h-56 bg-slate-100 rounded-2xl" />
      <div className="h-48 bg-slate-100 rounded-2xl" />
      <span className="sr-only">Loading health profile...</span>
    </div>
  )
}
