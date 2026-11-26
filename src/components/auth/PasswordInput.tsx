'use client'

import React, { useState, forwardRef } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { AuthInput, AuthInputProps } from './AuthInput'

export type PasswordInputProps = Omit<AuthInputProps, 'type' | 'endIcon'>

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (props, ref) => {
    const [showPassword, setShowPassword] = useState(false)

    return (
      <AuthInput
        ref={ref}
        type={showPassword ? 'text' : 'password'}
        endIcon={
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-700/20 transition-colors"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        }
        {...props}
      />
    )
  }
)

PasswordInput.displayName = 'PasswordInput'
