import { screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { ENV } from '@/core/config';
import { renderWithProviders } from '@/test/harness';

import { getCreditKindHelp } from './creditKinds';
import { ReclassifyCreditDialog } from './ReclassifyCreditDialog';
import { TopUpCreditDialog } from './TopUpCreditDialog';

const credit = { uuid: 'credit-uuid', paid_balance: 800, granted_balance: 700 };

const setAffiliates = (feature: boolean, backend: boolean) => {
  ENV.FEATURES = { reseller: { affiliates: feature } } as any;
  ENV.plugins = { WALDUR_CORE: { AFFILIATES_ENABLED: backend } } as any;
};

const mentionsAffiliates = (texts: string[]) =>
  texts.some((text) => /affiliate/i.test(text));

describe('affiliate fee in the credit help texts', () => {
  let saved;

  beforeEach(() => {
    saved = { FEATURES: ENV.FEATURES, plugins: ENV.plugins };
  });

  afterEach(() => {
    ENV.FEATURES = saved.FEATURES;
    ENV.plugins = saved.plugins;
  });

  it('is explained while the affiliate program is on', () => {
    setAffiliates(true, true);
    const help = getCreditKindHelp();
    expect(help.paid).toMatch(/counts towards the affiliate fee/);
    expect(help.granted).toMatch(/does not count towards the affiliate fee/);
    expect(help.withdrawable).toMatch(/affiliate fees/);
  });

  it.each([
    ['the feature is hidden', false, true],
    ['the backend has it off', true, false],
  ])('is left out when %s', (_, feature, backend) => {
    setAffiliates(feature, backend);
    expect(mentionsAffiliates(Object.values(getCreditKindHelp()))).toBe(false);
  });

  it('is left out of the dialogs when the program is off', () => {
    setAffiliates(false, false);
    const { unmount } = renderWithProviders(
      <TopUpCreditDialog resolve={{ credit }} />,
    );
    expect(
      screen.getByText(/Paid credit is spent after granted credit/),
    ).toBeInTheDocument();
    expect(screen.queryByText(/affiliate/i)).not.toBeInTheDocument();
    unmount();

    renderWithProviders(<ReclassifyCreditDialog resolve={{ credit }} />);
    expect(screen.getByText(/no longer expires/)).toBeInTheDocument();
    expect(screen.queryByText(/affiliate/i)).not.toBeInTheDocument();
  });

  it('is in the dialogs when the program is on', () => {
    setAffiliates(true, true);
    renderWithProviders(<TopUpCreditDialog resolve={{ credit }} />);
    expect(
      screen.getByText(/count towards the affiliate fee/),
    ).toBeInTheDocument();
  });
});
