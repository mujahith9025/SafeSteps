'use client'

import React, { useState } from 'react'
import { Plus, X, AlertCircle } from 'lucide-react'
import {
  cleanFreeText,
  containsContactDetails,
} from '@/lib/validations/profile'

export interface TagInputProps {
  id?: string
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  addButtonText?: string
  itemIcon?: React.ReactNode
  maxTags?: number
  disabled?: boolean
  error?: string
}

export function TagInput({
  id,
  tags,
  onChange,
  placeholder = 'Add new item...',
  addButtonText = 'Add',
  itemIcon,
  maxTags = 20,
  disabled = false,
  error: externalError,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [inputError, setInputError] = useState<string | null>(null)

  const handleAdd = () => {
    setInputError(null)
    const cleaned = cleanFreeText(inputValue)

    if (!cleaned) return

    if (tags.length >= maxTags) {
      setInputError(`Maximum ${maxTags} items allowed.`)
      return
    }

    if (cleaned.length > 40) {
      setInputError('Maximum 40 characters per entry.')
      return
    }

    if (containsContactDetails(cleaned)) {
      setInputError("Please don't include personal contact details")
      return
    }

    // Duplicate check (case-insensitive)
    if (tags.some((t) => t.toLowerCase() === cleaned.toLowerCase())) {
      setInputError('This entry is already in your list.')
      return
    }

    onChange([...tags, cleaned])
    setInputValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAdd()
    }
  }

  const handleRemove = (indexToRemove: number) => {
    onChange(tags.filter((_, idx) => idx !== indexToRemove))
  }

  const displayError = inputError || externalError

  return (
    <div className="flex flex-col gap-3">
      {/* Active Tags Chips */}
      {tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2" role="list" aria-label="Selected items">
          {tags.map((tag, idx) => (
            <div
              key={`${tag}-${idx}`}
              role="listitem"
              className="inline-flex items-center gap-1.5 bg-teal-50 border border-teal-200/70 text-teal-900 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-2xs transition-all"
            >
              {itemIcon}
              <span className="truncate max-w-[200px]">{tag}</span>
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                disabled={disabled}
                aria-label={`Remove ${tag}`}
                className="hover:bg-teal-200/60 active:bg-teal-200 text-teal-700 hover:text-teal-900 rounded-full p-0.5 ml-0.5 transition-colors focus:outline-none focus:ring-1 focus:ring-teal-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input & Add Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1">
          <input
            id={id}
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value)
              if (inputError) setInputError(null)
            }}
            onKeyDown={handleKeyDown}
            disabled={disabled || tags.length >= maxTags}
            aria-invalid={Boolean(displayError)}
            aria-describedby={displayError && id ? `${id}-error` : undefined}
            placeholder={
              tags.length >= maxTags
                ? `Maximum limit reached (${maxTags} items)`
                : placeholder
            }
            maxLength={60}
            className={`w-full h-11 bg-slate-50 border ${
              displayError
                ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                : 'border-slate-200/90 focus:border-teal-700 focus:ring-teal-700/10'
            } rounded-xl px-3.5 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed`}
          />
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={disabled || !inputValue.trim() || tags.length >= maxTags}
          className="h-11 px-4 bg-teal-50 hover:bg-teal-100 active:bg-teal-200 text-teal-800 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shrink-0 shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-teal-700/20"
        >
          <Plus className="w-4 h-4 text-teal-700" />
          <span>{addButtonText}</span>
        </button>
      </div>

      {/* Inline Error Message */}
      {displayError && (
        <div
          id={id ? `${id}-error` : undefined}
          role="alert"
          className="flex items-center gap-1.5 text-xs text-red-600 font-medium animate-in fade-in duration-150"
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{displayError}</span>
        </div>
      )}
    </div>
  )
}
