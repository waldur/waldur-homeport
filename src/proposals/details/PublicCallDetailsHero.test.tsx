import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { PublicCallDetailsHero } from './PublicCallDetailsHero';
import { usePublicCallApply } from './usePublicCallApply';

vi.mock('./usePublicCallApply', () => ({ usePublicCallApply: vi.fn() }));
vi.mock('./PublicCallApplyButton', () => ({
  PublicCallApplyButton: () => null,
}));
vi.mock('../CallProposalsButton', () => ({ CallProposalsButton: () => null }));
vi.mock('./CallDetailsHeaderBody', () => ({
  CallDetailsHeaderBody: () => null,
}));

const call = {
  uuid: 'call-1',
  name: 'Development Access',
  state: 'active',
  rounds: [],
} as any;

const apply = (result: Partial<ReturnType<typeof usePublicCallApply>>) =>
  vi.mocked(usePublicCallApply).mockReturnValue({
    hidden: false,
    ineligible: false,
    ...result,
  } as any);

const GENERIC =
  'Your account does not satisfy the applicant eligibility requirements of this call.';

describe('PublicCallDetailsHero eligibility notice', () => {
  beforeEach(() => vi.clearAllMocks());

  it('tells an applicant at the proposal limit that they must wait', () => {
    const message =
      'You have reached the maximum of 3 active projects or pending proposals.';
    apply({ ineligible: true, capacityMessage: message });
    renderWithProviders(<PublicCallDetailsHero call={call} />);
    expect(
      screen.getByText('You cannot apply to this call yet.'),
    ).toBeInTheDocument();
    expect(screen.getByText(message)).toBeInTheDocument();
    expect(screen.queryByText(GENERIC)).not.toBeInTheDocument();
  });

  it('keeps the generic notice for any other failing check', () => {
    apply({ ineligible: true });
    renderWithProviders(<PublicCallDetailsHero call={call} />);
    expect(
      screen.getByText('You are not eligible to apply to this call.'),
    ).toBeInTheDocument();
    expect(screen.getByText(GENERIC)).toBeInTheDocument();
  });

  it.each([
    [{}],
    [{ ineligible: true, hidden: true }],
    [{ ineligible: true, hidden: true, capacityMessage: 'At the limit.' }],
  ])('says nothing when there is nothing to explain (%j)', (result) => {
    apply(result);
    renderWithProviders(<PublicCallDetailsHero call={call} />);
    expect(
      screen.queryByText('You cannot apply to this call yet.'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('You are not eligible to apply to this call.'),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(GENERIC)).not.toBeInTheDocument();
  });
});
