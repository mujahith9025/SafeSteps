/**
 * SafeSteps Consent & Privacy Policy Versioning
 */

export const CURRENT_CONSENT_VERSION = '2026-11-v1'

export interface ConsentRecord {
  consent_version: string
  consent_accepted_at: string
  personalise: boolean
}
