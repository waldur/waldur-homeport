import { describe, expect, it } from 'vitest';

import { formatComplianceStatus } from './ComplianceStatusBadge';

describe('formatComplianceStatus', () => {
  it('reads N/A without a checklist', () => {
    expect(formatComplianceStatus(null)).toBe('N/A');
    expect(formatComplianceStatus({ has_checklist: false })).toBe('N/A');
  });

  it('puts review ahead of completion', () => {
    expect(
      formatComplianceStatus({
        has_checklist: true,
        requires_review: true,
        is_completed: true,
      }),
    ).toBe('Needs review');
  });

  it('reads OK when completed', () => {
    expect(
      formatComplianceStatus({ has_checklist: true, is_completed: true }),
    ).toBe('OK');
  });

  it('reads the percentage otherwise', () => {
    expect(
      formatComplianceStatus({
        has_checklist: true,
        completion_percentage: 42.9,
      }),
    ).toBe('42.9% complete');
    expect(formatComplianceStatus({ has_checklist: true })).toBe('0% complete');
  });
});
