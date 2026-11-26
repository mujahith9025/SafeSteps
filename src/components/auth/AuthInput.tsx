'use client'

import React, { forwardRef, InputHTMLAttributes } from 'react'
import { AlertCircle } from 'lucide-react'

export interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  helperText?: string
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, error, helperText, startIcon, endIcon, id, required, className = '', ...props }, ref) => {
    const inputId = id || props.name || Math.random().toString(36).substring(2, 9)
    const errorId = `${inputId}-error`
    const helperId = `${inputId}-helper`

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        <label
          htmlFor={inputId}
          className="text-sm font-semibold text-slate-700 flex items-center justify-between"
        >
          <span>
            {label} {required && <span className="text-red-500 font-bold">*</span>}
          </span>
        </label>

        <div className="relative w-full flex items-center">
          {startIcon && (
            <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center justify-center">
              {startIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            className={`w-full h-12 bg-white text-slate-900 placeholder:text-slate-400 text-sm sm:text-base rounded-xl border shadow-sm transition-all duration-150 outline-none
              ${startIcon ? 'pl-10' : 'pl-4'}
              ${endIcon || error ? 'pr-11' : 'pr-4'}
              ${
                error
                  ? 'border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                  : 'border-slate-200 hover:border-slate-300 focus:border-teal-700 focus:ring-4 focus:ring-teal-700/10'
              }
              ${className}
            `}
            {...props}
          />

          {endIcon && !error && (
            <div className="absolute right-3.5 text-slate-400 flex items-center justify-center">
              {endIcon}
            </div>
          )}

          {error && (
            <div className="absolute right-3.5 text-red-500 pointer-events-none flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
          )}
        </div>

        {error && (
          <p id={errorId} role="alert" className="text-xs text-red-600 font-medium flex items-center gap-1 mt-0.5">
            <span>{error}</span>
          </p>
        )}

        {!error && helperText && (
          <p id={helperId} className="text-xs text-slate-500 mt-0.5">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

AuthInput.displayName = 'AuthInput'
