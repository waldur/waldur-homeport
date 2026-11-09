import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CallDurationPolicy } from './CallDurationPolicy';

describe('CallDurationPolicy', () => {
  it('separates a fixed length from its prepaid cap in the text itself', () => {
    const { container } = render(
      <CallDurationPolicy
        call={{ fixed_duration_in_days: 365, max_prepaid_duration_months: 12 }}
      />,
    );
    expect(container.textContent).toBe(
      '365 days · Prepaid subscriptions up to 12 months.',
    );
  });

  it('separates the lengths to choose from what they mean', () => {
    const { container } = render(
      <CallDurationPolicy call={{ allowed_duration_months: [6, 12] }} />,
    );
    expect(container.textContent).toMatch(
      / · The applicant chooses one; no prepaid subscription may run longer\.$/,
    );
  });
});
