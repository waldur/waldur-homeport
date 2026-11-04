import { describe, expect, it } from 'vitest';
import { CreditTransaction } from 'waldur-js-client';

import { formatKindChanges } from './CreditTransactionsList';

const row = (changes: Partial<CreditTransaction>) =>
  ({
    granted_change: '0.00000',
    paid_change: '0.00000',
    earned_change: '0.00000',
    ...changes,
  }) as CreditTransaction;

describe('formatKindChanges', () => {
  it('names each kind a compensation drew on, in draw order', () => {
    expect(
      formatKindChanges(
        row({
          granted_change: '-60.00000',
          paid_change: '-190.00000',
          earned_change: '-50.00000',
        }),
      ),
    ).toMatch(/^Granted .*60.* · Paid .*190.* · Withdrawable .*50/);
  });

  it('shows only the kind a top-up opened', () => {
    const text = formatKindChanges(row({ paid_change: '500.00000' }));
    expect(text).toMatch(/^Paid /);
    expect(text).not.toMatch(/Granted|Withdrawable/);
  });

  it('has nothing to show for a project allocation row', () => {
    expect(
      formatKindChanges(
        row({ granted_change: null, paid_change: null, earned_change: null }),
      ),
    ).toBeNull();
  });

  it('has nothing to show for a row recorded before kinds existed', () => {
    expect(formatKindChanges(row({}))).toBeNull();
  });
});
