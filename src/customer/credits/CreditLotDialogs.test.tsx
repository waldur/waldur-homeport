import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  customerCreditsReclassify,
  customerCreditsTopUp,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { ReclassifyCreditDialog } from './ReclassifyCreditDialog';
import { TopUpCreditDialog } from './TopUpCreditDialog';
import { previewBalance } from './utils';

const credit = {
  uuid: 'credit-uuid',
  paid_balance: 800,
  granted_balance: 700,
};

const LABELS = {
  amount: /^Amount/,
  payment_reference: /^Payment reference/,
  comment: /^Comment/,
};

const type = async (user, field, value) => {
  const input = screen.getByLabelText(LABELS[field]);
  await user.clear(input);
  await user.type(input, value);
  await user.tab();
};

describe('TopUpCreditDialog', () => {
  const refetch = vi.fn();

  beforeEach(() => vi.clearAllMocks());

  it('records the prepayment with its comment and payment reference', async () => {
    const user = userEvent.setup();
    vi.mocked(customerCreditsTopUp).mockResolvedValue({} as any);
    renderWithProviders(<TopUpCreditDialog resolve={{ credit, refetch }} />);

    await type(user, 'amount', '500');
    await type(user, 'payment_reference', 'INV-2026-17');
    await type(user, 'comment', 'Prepayment for Q4');
    await user.click(screen.getByRole('button', { name: 'Top up' }));

    await waitFor(() =>
      expect(customerCreditsTopUp).toHaveBeenCalledWith({
        path: { uuid: 'credit-uuid' },
        body: {
          amount: '500',
          comment: 'Prepayment for Q4',
          payment_reference: 'INV-2026-17',
        },
      }),
    );
    expect(refetch).toHaveBeenCalled();
  });

  it('previews the paid credit after the top-up', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TopUpCreditDialog resolve={{ credit, refetch }} />);

    await type(user, 'amount', '500');

    expect(screen.getByText('€1,300.00')).toBeTruthy();
  });
});

describe('TopUpCreditDialog reversal', () => {
  it('refuses to reverse more than the paid credit', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <TopUpCreditDialog resolve={{ credit, refetch: vi.fn() }} />,
    );

    await type(user, 'amount', '-900');
    await type(user, 'comment', 'Typo in amount');

    expect(screen.getByText(/cannot exceed the paid credit/)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Top up' })).toBeDisabled();
  });
});

describe('ReclassifyCreditDialog', () => {
  const refetch = vi.fn();

  beforeEach(() => vi.clearAllMocks());

  it('refuses more than the granted credit', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <ReclassifyCreditDialog resolve={{ credit, refetch }} />,
    );

    await type(user, 'amount', '900');
    await type(user, 'comment', 'Was a prepayment');

    expect(screen.getByText(/exceeds the granted credit balance/)).toBeTruthy();
    // The preview keeps the balances an invalid amount could never reach.
    expect(screen.getByText('€700.00')).toBeTruthy();
    expect(screen.getByText('€800.00')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Reclassify' })).toBeDisabled();
    expect(customerCreditsReclassify).not.toHaveBeenCalled();
  });

  it('moves the amount from granted to paid credit', async () => {
    const user = userEvent.setup();
    vi.mocked(customerCreditsReclassify).mockResolvedValue({} as any);
    renderWithProviders(
      <ReclassifyCreditDialog resolve={{ credit, refetch }} />,
    );

    await type(user, 'amount', '300');
    await type(user, 'comment', 'Was a prepayment');

    // 700 - 300 granted, 800 + 300 paid.
    expect(screen.getByText('€400.00')).toBeTruthy();
    expect(screen.getByText('€1,100.00')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Reclassify' }));
    await waitFor(() =>
      expect(customerCreditsReclassify).toHaveBeenCalledWith({
        path: { uuid: 'credit-uuid' },
        body: { amount: '300', comment: 'Was a prepayment' },
      }),
    );
    expect(refetch).toHaveBeenCalled();
  });
});

describe('previewBalance', () => {
  it('applies the amount in either direction', () => {
    expect(previewBalance(800, '500')).toBe(1300);
    expect(previewBalance('700', 300, 'subtract')).toBe(400);
  });

  it('shows nothing while the amount is empty or not a number', () => {
    expect(previewBalance(800, '')).toBeUndefined();
    expect(previewBalance(800, undefined)).toBeUndefined();
    expect(previewBalance(800, 'abc')).toBeUndefined();
    expect(previewBalance(null, '5')).toBeUndefined();
  });
});
