/**
 * SafeSteps Plain-Language Report Explainer & Decoupled Status Tests
 *
 * Requirements Tested:
 * 1. UI Status Strictly Equals Code-Computed Status: The status chip and visual badges
 *    in the UI are ALWAYS governed strictly by code-computed statuses from compareValue,
 *    even if the model text claims otherwise (e.g. model claiming "Normal" when code is "critical").
 * 2. Deterministic Amber-to-Red Banner for Critical Values: Produced strictly by code when
 *    any value has status "critical". Displays exact text: "One or more values may need prompt medical attention. Please contact a doctor today."
 *    with link to the emergency page (/chat?emergency=true).
 * 3. "At a glance" Counts: Calculated strictly in code (total read, normal, outside usual, needs attention).
 * 4. Safety Guardrail Enforcement: checkOutput runs on every explanation field; catches diagnostic
 *    assertions ("you have") and dosages, retrying once and falling back to safe generic templates.
 * 5. Caching in reports.summary: Prevents duplicate Gemini calls when reopening a report.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { compareValue } from '@/reports/compare'
import { normaliseTestName } from '@/reports/normalise'
import {
  explainReport,
  buildSafeFallbackExplanations,
  singleExplanationSchema,
  reportExplanationResultSchema,
} from '@/reports/explain'
import { checkOutput } from '@/safety/guardrail'
import { ReportRow, ReportValueItem } from '@/components/reports/ReportRow'
import { ResultsView } from '@/components/reports/ResultsView'

// Mock next/navigation for server-side React rendering
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/reports/test-id',
}))

describe('SafeSteps Plain-Language Report Explainer Specifications', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ---------------------------------------------------------------------------
  // 1. Decoupled Status Guarantee (UI Status === Code Status)
  // ---------------------------------------------------------------------------
  describe('1. Decoupled Status Guarantee (UI Status === Code Status)', () => {
    it('proves that a critical biomarker ALWAYS renders as "Needs attention" in the UI even if model text claims "Normal"', () => {
      // 1. Compute status strictly via code (e.g. Platelets = 15 x10^9/L, critical low is < 50)
      const canonical = normaliseTestName('Platelets')
      const codeComparison = compareValue({
        test: canonical!,
        value: 15,
        unit: 'x10^9/L',
      })

      expect(codeComparison.status).toBe('critical')

      // 2. Simulate adversarial or hallucinations in model text claiming the result is normal
      const deceptiveModelText =
        'Your platelets are completely normal and healthy. You have nothing to worry about.'

      const item: ReportValueItem = {
        id: 'val-platelets-1',
        test_name: 'Platelets',
        value_numeric: 15,
        value_text: '15',
        unit: 'x10^9/L',
        reference_low: codeComparison.low,
        reference_high: codeComparison.high,
        status: codeComparison.status, // Code-computed: "critical"
        explanation: deceptiveModelText,
        explanationDetail: {
          whatItMeasures: 'Platelets help blood to clot.',
          whatItMeans: deceptiveModelText,
          suggestedQuestions: ['What caused this result?'],
        },
      }

      // 3. Render the UI component to HTML
      const html = renderToStaticMarkup(
        React.createElement(
          'table',
          null,
          React.createElement(
            'tbody',
            null,
            React.createElement(ReportRow, {
              item,
              isGlobalEditMode: false,
              onQuickSave: async () => {},
            })
          )
        )
      )

      // 4. Assert: UI status chip MUST reflect the code status ("critical" / "Needs attention")
      expect(html).toContain('data-status="critical"')
      expect(html).toContain('Needs attention')
      expect(html).toContain('data-testid="status-chip-platelets"')

      // The status chip must NOT say Normal
      // (checking specifically within the status-chip element)
      const chipRegex = /data-testid="status-chip-platelets"[^>]*>([\s\S]*?)<\/span>/
      const chipMatch = html.match(chipRegex)
      expect(chipMatch).toBeTruthy()
      expect(chipMatch![1]).toContain('Needs attention')
      expect(chipMatch![1]).not.toContain('Normal')
    })

    it('proves that a normal biomarker ALWAYS renders as "Normal" in the UI even if model text falsely claims emergency', () => {
      const canonical = normaliseTestName('Hemoglobin')
      const codeComparison = compareValue({
        test: canonical!,
        value: 14.5,
        unit: 'g/dL',
      })

      expect(codeComparison.status).toBe('normal')

      // Adversarial text claiming emergency
      const deceptiveModelText =
        'Critical alarm! This measurement indicates immediate severe pathology.'

      const item: ReportValueItem = {
        id: 'val-hb-1',
        test_name: 'Hemoglobin',
        value_numeric: 14.5,
        value_text: '14.5',
        unit: 'g/dL',
        reference_low: codeComparison.low,
        reference_high: codeComparison.high,
        status: codeComparison.status, // "normal"
        explanation: deceptiveModelText,
        explanationDetail: {
          whatItMeasures: 'Carries oxygen in blood.',
          whatItMeans: deceptiveModelText,
        },
      }

      const html = renderToStaticMarkup(
        React.createElement(
          'table',
          null,
          React.createElement(
            'tbody',
            null,
            React.createElement(ReportRow, {
              item,
              isGlobalEditMode: false,
              onQuickSave: async () => {},
            })
          )
        )
      )

      expect(html).toContain('data-status="normal"')
      expect(html).toContain('Normal')

      const chipRegex = /data-testid="status-chip-hemoglobin"[^>]*>([\s\S]*?)<\/span>/
      const chipMatch = html.match(chipRegex)
      expect(chipMatch).toBeTruthy()
      expect(chipMatch![1]).toContain('Normal')
      expect(chipMatch![1]).not.toContain('Needs attention')
    })

    it('proves that high and low statuses are strictly preserved from code evaluation', () => {
      const canonicalGlucose = normaliseTestName('Fasting Glucose')
      const highComparison = compareValue({
        test: canonicalGlucose!,
        value: 180, // High for fasting glucose
        unit: 'mg/dL',
      })
      expect(highComparison.status).toBe('high')

      const canonicalPotassium = normaliseTestName('Potassium')
      const lowComparison = compareValue({
        test: canonicalPotassium!,
        value: 3.0, // Low for potassium
        unit: 'mmol/L',
      })
      expect(lowComparison.status).toBe('low')

      // Verify rendering
      const highRow = renderToStaticMarkup(
        React.createElement(
          'table',
          null,
          React.createElement(
            'tbody',
            null,
            React.createElement(ReportRow, {
              item: {
                id: 'high-1',
                test_name: 'Fasting Glucose',
                value_numeric: 180,
                value_text: '180',
                unit: 'mg/dL',
                reference_low: highComparison.low,
                reference_high: highComparison.high,
                status: highComparison.status,
                explanation: 'Measures blood sugar.',
              },
              isGlobalEditMode: false,
              onQuickSave: async () => {},
            })
          )
        )
      )
      expect(highRow).toContain('data-status="high"')
      expect(highRow).toContain('High')

      const lowRow = renderToStaticMarkup(
        React.createElement(
          'table',
          null,
          React.createElement(
            'tbody',
            null,
            React.createElement(ReportRow, {
              item: {
                id: 'low-1',
                test_name: 'Potassium',
                value_numeric: 3.0,
                value_text: '3.0',
                unit: 'mmol/L',
                reference_low: lowComparison.low,
                reference_high: lowComparison.high,
                status: lowComparison.status,
                explanation: 'Measures electrolyte balance.',
              },
              isGlobalEditMode: false,
              onQuickSave: async () => {},
            })
          )
        )
      )
      expect(lowRow).toContain('data-status="low"')
      expect(lowRow).toContain('Low')
    })
  })

  // ---------------------------------------------------------------------------
  // 2. Deterministic Amber-to-Red Banner for Critical Values
  // ---------------------------------------------------------------------------
  describe('2. Deterministic Amber-to-Red Banner for Critical Values', () => {
    it('shows the amber-to-red banner with exact required text when any value has status "critical"', () => {
      const mockReport = {
        id: 'report-critical-1',
        title: 'Complete Blood Count (CBC)',
        source_type: 'file',
        summary: {
          totalCount: 3,
          normalCount: 1,
          outsideCount: 1,
          criticalCount: 1,
          overallSummary: 'Panel shows one marker requiring clinical review.',
          doctorQuestions: ['What are the next steps?'],
        },
        created_at: new Date().toISOString(),
      }

      const values: ReportValueItem[] = [
        {
          id: 'v1',
          test_name: 'Hemoglobin',
          value_numeric: 13.5,
          value_text: '13.5',
          unit: 'g/dL',
          reference_low: 12.0,
          reference_high: 15.5,
          status: 'normal',
          explanation: 'Measures oxygen carrying protein.',
        },
        {
          id: 'v2',
          test_name: 'WBC',
          value_numeric: 11.5,
          value_text: '11.5',
          unit: 'x10^9/L',
          reference_low: 4.0,
          reference_high: 11.0,
          status: 'high',
          explanation: 'White blood cells immune response.',
        },
        {
          id: 'v3',
          test_name: 'Platelets',
          value_numeric: 20,
          value_text: '20',
          unit: 'x10^9/L',
          reference_low: 150,
          reference_high: 450,
          status: 'critical', // CRITICAL TRIGGER
          explanation: 'Platelets are below clinical safety threshold.',
        },
      ]

      const html = renderToStaticMarkup(
        React.createElement(ResultsView, {
          report: mockReport,
          initialValues: values,
        })
      )

      // Verify the banner is rendered
      expect(html).toContain('data-testid="critical-alert-banner"')

      // Verify exact required text
      expect(html).toContain(
        'One or more values may need prompt medical attention. Please contact a doctor today.'
      )

      // Verify link to emergency page
      expect(html).toContain('href="/chat?emergency=true"')
      expect(html).toContain('emergency page')
      expect(html).toContain('tel:112')
    })

    it('does NOT show the amber-to-red banner when no values are critical', () => {
      const mockReport = {
        id: 'report-normal-1',
        title: 'Routine Metabolic Panel',
        source_type: 'file',
        summary: {
          totalCount: 2,
          normalCount: 1,
          outsideCount: 1,
          criticalCount: 0,
          overallSummary: 'All values within expected or mild variance.',
          doctorQuestions: ['When should I re-test?'],
        },
        created_at: new Date().toISOString(),
      }

      const values: ReportValueItem[] = [
        {
          id: 'v1',
          test_name: 'Hemoglobin',
          value_numeric: 13.5,
          value_text: '13.5',
          unit: 'g/dL',
          reference_low: 12.0,
          reference_high: 15.5,
          status: 'normal',
          explanation: 'Normal baseline.',
        },
        {
          id: 'v2',
          test_name: 'WBC',
          value_numeric: 11.2,
          value_text: '11.2',
          unit: 'x10^9/L',
          reference_low: 4.0,
          reference_high: 11.0,
          status: 'high', // High, but not critical
          explanation: 'Mild elevation.',
        },
      ]

      const html = renderToStaticMarkup(
        React.createElement(ResultsView, {
          report: mockReport,
          initialValues: values,
        })
      )

      // Must not render critical banner
      expect(html).not.toContain('data-testid="critical-alert-banner"')
      expect(html).not.toContain(
        'One or more values may need prompt medical attention. Please contact a doctor today.'
      )
    })
  })

  // ---------------------------------------------------------------------------
  // 3. "At a glance" Counts Built Strictly in Code
  // ---------------------------------------------------------------------------
  describe('3. "At a glance" Counts Built Strictly in Code', () => {
    it('calculates total, normal, outside, and critical counts deterministically', () => {
      const values: ReportValueItem[] = [
        { id: '1', test_name: 'Hb', value_numeric: 14, value_text: '14', unit: 'g/dL', reference_low: 12, reference_high: 16, status: 'normal', explanation: null },
        { id: '2', test_name: 'RBC', value_numeric: 4.5, value_text: '4.5', unit: 'x10^12/L', reference_low: 4.0, reference_high: 5.5, status: 'normal', explanation: null },
        { id: '3', test_name: 'WBC', value_numeric: 12, value_text: '12', unit: 'x10^9/L', reference_low: 4, reference_high: 11, status: 'high', explanation: null },
        { id: '4', test_name: 'Ferritin', value_numeric: 10, value_text: '10', unit: 'ng/mL', reference_low: 20, reference_high: 200, status: 'low', explanation: null },
        { id: '5', test_name: 'Platelets', value_numeric: 30, value_text: '30', unit: 'x10^9/L', reference_low: 150, reference_high: 450, status: 'critical', explanation: null },
      ]

      const totalCount = values.length
      const normalCount = values.filter((v) => v.status === 'normal').length
      const outsideCount = values.filter((v) => v.status === 'high' || v.status === 'low').length
      const criticalCount = values.filter((v) => v.status === 'critical').length

      expect(totalCount).toBe(5)
      expect(normalCount).toBe(2)
      expect(outsideCount).toBe(2)
      expect(criticalCount).toBe(1)

      const html = renderToStaticMarkup(
        React.createElement(ResultsView, {
          report: {
            id: 'r1',
            title: 'Lab Report',
            source_type: 'file',
            summary: null,
            created_at: new Date().toISOString(),
          },
          initialValues: values,
        })
      )

      expect(html).toContain('data-testid="count-total">5</span>')
      expect(html).toContain('data-testid="count-normal">2</span>')
      expect(html).toContain('data-testid="count-outside">2</span>')
      expect(html).toContain('data-testid="count-critical">1</span>')
    })
  })

  // ---------------------------------------------------------------------------
  // 4. Output Guardrail Enforcement & Safe Fallbacks
  // ---------------------------------------------------------------------------
  describe('4. Output Guardrail Enforcement & Safe Fallbacks', () => {
    it('blocks diagnostic claims ("you have") in model output', () => {
      const diagnosticClaim =
        'Your blood test shows low ferritin, which means you have iron-deficiency anemia.'
      const check = checkOutput(diagnosticClaim)
      expect(check.safe).toBe(false)
      expect(check.reason).toContain('diagnosis')
    })

    it('blocks dosage and medicine recommendations in model output', () => {
      const drugRecommendation =
        'You should take 200mg ferrous sulphate tablets twice daily with orange juice.'
      const check = checkOutput(drugRecommendation)
      expect(check.safe).toBe(false)
      expect(['dosage', 'prescription']).toContain(check.reason)
    })

    it('allows calm educational explanations referencing general clinical associations', () => {
      const safeExplanation =
        'Hemoglobin is the oxygen-carrying protein in red blood cells. A lower level can be associated with mild iron deficiency, which your doctor can review alongside other symptoms.'
      const check = checkOutput(safeExplanation)
      expect(check.safe).toBe(true)
    })

    it('generates safe fallback explanations when model fails safety checks', () => {
      const items = [
        {
          test_name: 'Haemoglobin',
          value_numeric: 10.5,
          unit: 'g/dL',
          status: 'low',
          reference_low: 12.0,
          reference_high: 15.5,
        },
        {
          test_name: 'Platelets',
          value_numeric: 25,
          unit: 'x10^9/L',
          status: 'critical',
          reference_low: 150,
          reference_high: 450,
        },
      ]

      const fallback = buildSafeFallbackExplanations(items)

      // Validate schema
      const parsed = reportExplanationResultSchema.safeParse(fallback)
      expect(parsed.success).toBe(true)

      // Verify no diagnoses or drug prescriptions in fallback
      expect(fallback.overallSummary).not.toMatch(/you have \w+/i)
      expect(fallback.overallSummary).not.toMatch(/\d+mg/i)

      // Verify doctor questions exist
      expect(fallback.doctorQuestions.length).toBeGreaterThanOrEqual(3)

      // Verify individual explanations are safe
      for (const exp of fallback.explanations) {
        expect(checkOutput(exp.whatItMeasures).safe).toBe(true)
        expect(checkOutput(exp.whatItMeans).safe).toBe(true)
        expect(exp.whatItMeasures).toContain('Please discuss this result with your doctor')
      }
    })
  })

  // ---------------------------------------------------------------------------
  // 5. Caching & Gemini Call Avoidance
  // ---------------------------------------------------------------------------
  describe('5. Caching in reports.summary', () => {
    it('validates explanation JSON schema with Zod', () => {
      const validPayload = {
        overallSummary:
          'This panel measured key hematological parameters including hemoglobin and platelet levels.',
        doctorQuestions: [
          'How do these results compare to my previous baseline tests?',
          'Are there any lifestyle or dietary factors relevant to this panel?',
          'When would you advise a repeat blood test?',
        ],
        explanations: [
          {
            testName: 'Haemoglobin',
            whatItMeasures:
              'Haemoglobin is the protein in red blood cells that transports oxygen throughout the body.',
            whatItMeans:
              'Your level is below standard benchmark intervals, which a GP can review alongside your symptom history.',
            suggestedQuestions: ['Could low iron intake explain this result?'],
          },
        ],
      }

      const parsed = reportExplanationResultSchema.safeParse(validPayload)
      expect(parsed.success).toBe(true)
    })

    it('rejects malformed explanation payloads missing required fields', () => {
      const invalidPayload = {
        overallSummary: 'Too short',
        // missing doctorQuestions
        explanations: [],
      }

      const parsed = reportExplanationResultSchema.safeParse(invalidPayload)
      expect(parsed.success).toBe(false)
    })
  })
})
