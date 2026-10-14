import { describe, expect, it } from 'vitest';

import { formatPolicyComment, isPolicyComment } from './utils';

describe('version-history utils', () => {
  describe('isPolicyComment', () => {
    it('detects policy action comments', () => {
      expect(
        isPolicyComment(
          "Policy action 'block': blocked changed from False to True.",
        ),
      ).toBe(true);
      expect(isPolicyComment('Regular comment')).toBe(false);
      expect(isPolicyComment(undefined)).toBe(false);
    });
  });

  describe('formatPolicyComment', () => {
    it('formats policy comment with scope', () => {
      const comment =
        "Policy action 'block': blocked changed from False to True. Policy: CustomerEstimatedCostPolicy 4f1a2b3c. Scope: Project A.";
      expect(formatPolicyComment(comment)).toBe(
        'blocked: False → True (Project A)',
      );
    });

    it('formats policy comment without scope', () => {
      const comment =
        "Policy action 'block': blocked changed from False to True. Policy: CustomerEstimatedCostPolicy 4f1a2b3c.";
      expect(formatPolicyComment(comment)).toBe(
        'blocked: False → True (CustomerEstimatedCostPolicy)',
      );
    });

    it('formats policy comment with created by and extra text', () => {
      const comment =
        "Policy action 'terminate': state changed from OK to ERRED. Policy: VMTermPolicy abc12345. Created by: admin. Reason: quota exceeded";
      expect(formatPolicyComment(comment)).toBe(
        'state: OK → ERRED (VMTermPolicy) Reason: quota exceeded',
      );
    });

    it('returns raw comment if not matching format', () => {
      expect(formatPolicyComment('Policy action: unknown format')).toBe(
        'Policy action: unknown format',
      );
    });
  });
});
