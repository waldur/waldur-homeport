import { describe, expect, it } from 'vitest';

import { getChangeLabel } from './options';

describe('getChangeLabel', () => {
  it('compares a calendar period with the same days of the previous one', () => {
    expect(getChangeLabel('month')).toBe(
      'Change vs the same days of the previous month',
    );
    expect(getChangeLabel('quarter')).toBe(
      'Change vs the same days of the previous quarter',
    );
  });

  it('compares a rolling window with the window before it', () => {
    expect(getChangeLabel('rolling_30d')).toBe(
      'Change vs the previous 30 days',
    );
  });
});
