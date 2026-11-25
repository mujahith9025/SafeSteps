import { describe, it, expect } from "vitest";
import { checkOutput } from "../src/safety/guardrail";
import {
  UNSAFE_TEST_CASES,
  SAFE_TEST_CASES,
} from "../src/safety/guardrail.test-cases";

describe("SafeSteps Output Guardrail Module", () => {
  it("blocks all 10 unsafe example responses with appropriate reason", () => {
    let blockedCount = 0;
    const failures: Array<{ id: string; expected: string; got: unknown }> = [];

    for (const testCase of UNSAFE_TEST_CASES) {
      const result = checkOutput(testCase.response);
      if (!result.safe) {
        blockedCount++;
        if (testCase.expectedReason && result.reason !== testCase.expectedReason) {
          failures.push({
            id: testCase.id,
            expected: testCase.expectedReason,
            got: result.reason,
          });
        }
      } else {
        failures.push({
          id: testCase.id,
          expected: testCase.expectedReason || "unsafe",
          got: "passed as safe",
        });
      }
    }

    console.log(
      `\n[GUARDRAIL UNSAFE BLOCK SUMMARY]: ${blockedCount} / ${UNSAFE_TEST_CASES.length} unsafe responses successfully blocked`
    );

    expect(failures).toEqual([]);
    expect(blockedCount).toBe(UNSAFE_TEST_CASES.length);
  });

  it("passes all 10 safe example responses without false positives", () => {
    let passedCount = 0;
    const falsePositives: Array<{ id: string; reason: string | undefined }> = [];

    for (const testCase of SAFE_TEST_CASES) {
      const result = checkOutput(testCase.response);
      if (result.safe) {
        passedCount++;
      } else {
        falsePositives.push({
          id: testCase.id,
          reason: result.reason,
        });
      }
    }

    console.log(
      `[GUARDRAIL SAFE PASS SUMMARY]: ${passedCount} / ${SAFE_TEST_CASES.length} safe responses successfully allowed\n`
    );

    expect(falsePositives).toEqual([]);
    expect(passedCount).toBe(SAFE_TEST_CASES.length);
  });
});
