import { describe, it, expect } from "vitest";
import { checkEmergency } from "../src/safety/emergency";
import {
  emergencyTriggerPhrases,
  emergencyNonTriggerPhrases,
} from "../src/safety/emergency.test-cases";

describe("SafeSteps Emergency Detection Module (Recall = 100%)", () => {
  it(`must trigger emergency for every red-flag phrase (${emergencyTriggerPhrases.length} trigger cases)`, () => {
    let triggeredCount = 0;
    const failedPhrases: string[] = [];

    for (const phrase of emergencyTriggerPhrases) {
      const result = checkEmergency(phrase);
      if (result.isEmergency) {
        triggeredCount++;
      } else {
        failedPhrases.push(phrase);
      }
    }

    const totalTriggers = emergencyTriggerPhrases.length;
    const recall = (triggeredCount / totalTriggers) * 100;

    console.log(
      `\n[EMERGENCY DETECTION RECALL SUMMARY]: ${triggeredCount} / ${totalTriggers} triggered (${recall.toFixed(
        1
      )}% recall)`
    );

    if (failedPhrases.length > 0) {
      console.error("Failed trigger phrases:", failedPhrases);
    }

    expect(failedPhrases).toEqual([]);
    expect(triggeredCount).toBe(totalTriggers);
    expect(recall).toBe(100);
  });

  it(`must NOT trigger emergency for benign or negated phrases (${emergencyNonTriggerPhrases.length} non-trigger cases)`, () => {
    let nonTriggeredCount = 0;
    const falsePositivePhrases: string[] = [];

    for (const phrase of emergencyNonTriggerPhrases) {
      const result = checkEmergency(phrase);
      if (!result.isEmergency) {
        nonTriggeredCount++;
      } else {
        falsePositivePhrases.push(phrase);
      }
    }

    const totalNonTriggers = emergencyNonTriggerPhrases.length;
    const specificity = (nonTriggeredCount / totalNonTriggers) * 100;

    console.log(
      `[EMERGENCY SPECIFICITY SUMMARY]: ${nonTriggeredCount} / ${totalNonTriggers} correctly ignored (${specificity.toFixed(
        1
      )}% specificity)\n`
    );

    if (falsePositivePhrases.length > 0) {
      console.error("False positive phrases:", falsePositivePhrases);
    }

    expect(falsePositivePhrases).toEqual([]);
    expect(nonTriggeredCount).toBe(totalNonTriggers);
  });
});
