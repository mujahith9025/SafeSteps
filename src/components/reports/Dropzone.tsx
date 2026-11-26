'use client'

import React, { useRef, useState } from 'react'
import { UploadCloud, Shield } from 'lucide-react'

interface DropzoneProps {
  onFileSelect: (file: File) => void
  disabled?: boolean
}

export function Dropzone({ onFileSelect, disabled = false }: DropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    if (disabled) return

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0])
      // Reset input so same file can be re-selected if removed
      e.target.value = ''
    }
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => {
        if (!disabled && inputRef.current) {
          inputRef.current.click()
        }
      }}
      className={`group relative flex flex-col items-center justify-center p-8 sm:p-12 rounded-2xl transition-all cursor-pointer text-center border-2 border-dashed ${
        isDragOver
          ? 'bg-teal-50/80 border-teal-600 scale-[1.01]'
          : 'bg-[#eff4ff]/60 hover:bg-[#eff4ff] border-teal-600/30 hover:border-teal-600/60'
      } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          inputRef.current?.click()
        }
      }}
      aria-label="Upload laboratory report file"
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg"
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />

      <div className="w-16 h-16 rounded-full bg-[#bdece2] text-[#005c55] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-xs">
        <UploadCloud className="w-8 h-8" />
      </div>

      <p className="font-medium text-slate-900 text-base mb-1">
        Drag and drop your lab report here, or{' '}
        <span className="text-teal-700 font-semibold underline underline-offset-4 decoration-teal-600/40 group-hover:decoration-teal-600">
          browse files
        </span>
      </p>

      <p className="text-xs text-slate-500 mb-4">
        Supports PDF, JPG, PNG (up to 5 MB per document)
      </p>

      {/* Privacy Assurance Pill inside dropzone matching Stitch */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-teal-800 text-xs font-medium shadow-xs border border-teal-100">
        <Shield className="w-3.5 h-3.5 text-teal-700" />
        <span>Your file is deleted immediately after processing</span>
      </div>
    </div>
  )
}
