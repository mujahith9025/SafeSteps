'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck, AlertCircle } from 'lucide-react'
import { BasicsCard } from './BasicsCard'
import { AllergiesCard } from './AllergiesCard'
import { ConditionsCard } from './ConditionsCard'
import { MedicinesCard } from './MedicinesCard'
import { PreferencesCard } from './PreferencesCard'
import { DeleteProfileModal } from './DeleteProfileModal'
import { StickySaveBar } from './StickySaveBar'
import { ProfileToast } from './ProfileToast'
import { saveProfileAction, deleteHealthProfileAction } from '@/app/(app)/profile/actions'
import type { ProfileFormValues } from '@/lib/validations/profile'

export interface InitialProfileData {
  age?: number | null
  sex?: 'female' | 'male' | 'undisclosed' | string | null
  height_cm?: number | null
  weight_kg?: number | null
  pregnant?: boolean | null
  allergies?: string[] | null
  conditions?: string[] | null
  medicines?: string[] | null
  preferred_language?: 'en' | 'ta' | 'hi' | string | null
  personalise?: boolean | null
}

interface ProfileFormProps {
  initialData?: InitialProfileData | null
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const router = useRouter()

  // Base state
  const [savedData, setSavedData] = useState<InitialProfileData>(() => ({
    age: initialData?.age ?? null,
    sex: (initialData?.sex as 'female' | 'male' | 'undisclosed' | null) ?? null,
    height_cm: initialData?.height_cm ?? null,
    weight_kg: initialData?.weight_kg ?? null,
    pregnant: Boolean(initialData?.pregnant),
    allergies: initialData?.allergies ?? [],
    conditions: initialData?.conditions ?? [],
    medicines: initialData?.medicines ?? [],
    preferred_language: (initialData?.preferred_language as 'en' | 'ta' | 'hi') ?? 'en',
    personalise: Boolean(initialData?.personalise),
  }))

  const [age, setAge] = useState<number | null>(savedData.age ?? null)
  const [sex, setSex] = useState<'female' | 'male' | 'undisclosed' | null>(savedData.sex as any ?? null)
  const [heightCm, setHeightCm] = useState<number | null>(savedData.height_cm ?? null)
  const [weightKg, setWeightKg] = useState<number | null>(savedData.weight_kg ?? null)
  const [pregnant, setPregnant] = useState<boolean>(savedData.pregnant ?? false)
  const [allergies, setAllergies] = useState<string[]>(savedData.allergies ?? [])
  const [conditions, setConditions] = useState<string[]>(savedData.conditions ?? [])
  const [medicines, setMedicines] = useState<string[]>(savedData.medicines ?? [])
  const [language, setLanguage] = useState<'en' | 'ta' | 'hi'>(savedData.preferred_language as any ?? 'en')
  const [personalise, setPersonalise] = useState<boolean>(savedData.personalise ?? false)

  // Status & modal states
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('Your clinical context has been securely updated.')
  const [toastTitle, setToastTitle] = useState('Profile saved')
  const [globalError, setGlobalError] = useState<string | null>(null)

  // Maternal safety rule: Pregnancy is only applicable for female aged 12-55
  useEffect(() => {
    const isEligibleFemale = sex === 'female' && age !== null && age >= 12 && age <= 55
    if (!isEligibleFemale && pregnant) {
      setPregnant(false)
    }
  }, [sex, age, pregnant])

  // Track if current state differs from last saved state
  const isDirty = useMemo(() => {
    if (age !== (savedData.age ?? null)) return true
    if (sex !== (savedData.sex ?? null)) return true
    if (heightCm !== (savedData.height_cm ?? null)) return true
    if (weightKg !== (savedData.weight_kg ?? null)) return true
    if (pregnant !== Boolean(savedData.pregnant)) return true
    if (language !== (savedData.preferred_language ?? 'en')) return true
    if (personalise !== Boolean(savedData.personalise)) return true

    const arrDiff = (a: string[], b: string[]) =>
      a.length !== b.length || a.some((val, idx) => val !== b[idx])

    if (arrDiff(allergies, savedData.allergies ?? [])) return true
    if (arrDiff(conditions, savedData.conditions ?? [])) return true
    if (arrDiff(medicines, savedData.medicines ?? [])) return true

    return false
  }, [
    age,
    sex,
    heightCm,
    weightKg,
    pregnant,
    allergies,
    conditions,
    medicines,
    language,
    personalise,
    savedData,
  ])

  // Browser navigation warning when unsaved changes exist
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  // Revert changes
  const handleReset = () => {
    setAge(savedData.age ?? null)
    setSex(savedData.sex as any ?? null)
    setHeightCm(savedData.height_cm ?? null)
    setWeightKg(savedData.weight_kg ?? null)
    setPregnant(Boolean(savedData.pregnant))
    setAllergies(savedData.allergies ?? [])
    setConditions(savedData.conditions ?? [])
    setMedicines(savedData.medicines ?? [])
    setLanguage((savedData.preferred_language as any) ?? 'en')
    setPersonalise(Boolean(savedData.personalise))
    setGlobalError(null)
  }

  // Save profile
  const handleSave = async () => {
    setGlobalError(null)
    setIsSaving(true)

    const payload: ProfileFormValues = {
      age,
      sex,
      height_cm: heightCm,
      weight_kg: weightKg,
      pregnant,
      allergies,
      conditions,
      medicines,
      preferred_language: language,
      personalise,
    }

    try {
      const result = await saveProfileAction(payload)
      if (!result.success) {
        setGlobalError(result.error || 'Failed to update profile.')
        setIsSaving(false)
        return
      }

      // Update saved reference
      setSavedData({
        age,
        sex,
        height_cm: heightCm,
        weight_kg: weightKg,
        pregnant,
        allergies,
        conditions,
        medicines,
        preferred_language: language,
        personalise,
      })

      setToastTitle('Profile saved')
      setToastMessage('Your clinical context has been securely updated.')
      setShowToast(true)
      router.refresh()
    } catch {
      setGlobalError('Connection error. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  // Delete profile
  const handleDeleteProfile = async () => {
    setIsDeleting(true)
    setGlobalError(null)

    try {
      const result = await deleteHealthProfileAction()
      if (!result.success) {
        setGlobalError(result.error || 'Failed to delete health profile.')
        setIsDeleting(false)
        setIsDeleteModalOpen(false)
        return
      }

      // Reset all form state
      const emptyState: InitialProfileData = {
        age: null,
        sex: null,
        height_cm: null,
        weight_kg: null,
        pregnant: false,
        allergies: [],
        conditions: [],
        medicines: [],
        preferred_language: language,
        personalise: false,
      }

      setSavedData(emptyState)
      setAge(null)
      setSex(null)
      setHeightCm(null)
      setWeightKg(null)
      setPregnant(false)
      setAllergies([])
      setConditions([])
      setMedicines([])
      setPersonalise(false)

      setIsDeleteModalOpen(false)
      setToastTitle('Health profile cleared')
      setToastMessage('All clinical details were permanently deleted. Your account remains active.')
      setShowToast(true)
      router.refresh()
    } catch {
      setGlobalError('Connection error while resetting profile.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6 pb-28">
      {/* Introduction Banner */}
      <div className="flex flex-col gap-1.5 pb-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-teal-800">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/70">
            <ShieldCheck className="w-4 h-4 text-teal-700" />
            <span>Secure Clinical Profile</span>
          </div>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500 font-medium hidden sm:inline">
            Encrypted strictly with Supabase RLS
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
          Your health profile
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
          This helps SafeSteps give more relevant, personalized triage guidance. Everything here is completely optional and you can modify or permanently purge it at any time.
        </p>
      </div>

      {/* Global Error Banner */}
      {globalError && (
        <div
          role="alert"
          className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-xs text-red-700 animate-in fade-in"
        >
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{globalError}</span>
        </div>
      )}

      {/* Structured Sections Stack */}
      <div className="space-y-6">
        {/* Section 1: Basics */}
        <BasicsCard
          age={age}
          sex={sex}
          height_cm={heightCm}
          weight_kg={weightKg}
          pregnant={pregnant}
          onAgeChange={setAge}
          onSexChange={setSex}
          onHeightChange={setHeightCm}
          onWeightChange={setWeightKg}
          onPregnantChange={setPregnant}
          disabled={isSaving}
        />

        {/* Section 2: Allergies */}
        <AllergiesCard
          allergies={allergies}
          onChange={setAllergies}
          disabled={isSaving}
        />

        {/* Section 3: Health Conditions */}
        <ConditionsCard
          conditions={conditions}
          onChange={setConditions}
          disabled={isSaving}
        />

        {/* Section 4: Current Medicines */}
        <MedicinesCard
          medicines={medicines}
          onChange={setMedicines}
          disabled={isSaving}
        />

        {/* Section 5: Preferences */}
        <PreferencesCard
          language={language}
          personalise={personalise}
          onLanguageChange={setLanguage}
          onPersonaliseChange={setPersonalise}
          disabled={isSaving}
        />

        {/* Section 6: Delete Health Profile (Danger Area) */}
        <div className="bg-red-50/50 rounded-2xl border border-red-200/70 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1 max-w-xl">
            <h2 className="text-sm font-bold text-red-900">Delete my health profile</h2>
            <p className="text-xs text-red-700/85 leading-relaxed">
              This will permanently remove your age, biometric details, allergies, conditions, and stored medications. Your account and login remain active.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            disabled={isSaving || isDeleting}
            className="px-4 py-2.5 bg-white hover:bg-red-600 hover:text-white text-red-700 border border-red-200 hover:border-transparent rounded-xl text-xs font-semibold shadow-2xs transition-all shrink-0 focus:outline-none focus:ring-2 focus:ring-red-600/30"
          >
            Delete profile
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      <DeleteProfileModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteProfile}
        isDeleting={isDeleting}
      />

      {/* Sticky Save Bar */}
      <StickySaveBar
        isDirty={isDirty}
        isSaving={isSaving}
        onSave={handleSave}
        onReset={handleReset}
      />

      {/* Toast Notification */}
      <ProfileToast
        show={showToast}
        title={toastTitle}
        message={toastMessage}
        onDismiss={() => setShowToast(false)}
      />
    </div>
  )
}
