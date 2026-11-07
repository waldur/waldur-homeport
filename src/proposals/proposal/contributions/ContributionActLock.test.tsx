import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { useModal } from '@/modal/actions';
import { renderWithProviders } from '@/test/harness';

import { actsAsOutsider, ContributionActLock } from './ContributionActLock';

const slot = {
  is_per_offering: true,
  offering_uuid: 'booster',
  offering_name: 'Booster partition',
  delegate_uuid: null,
  contributor_uuid: null,
  can_fill: true,
  can_delegate: true,
} as any;

const onOffering = (uuid: string) => ({
  uuid: 'u',
  permissions: [{ scope_type: 'offering', scope_uuid: uuid }],
});

describe('who acts on an offering team’s contribution from outside it', () => {
  it('is a call manager or staff, with no role on the offering', () => {
    expect(actsAsOutsider({ uuid: 'cm', permissions: [] } as any, slot)).toBe(
      true,
    );
  });

  it('is not its team, its delegate or its writer', () => {
    expect(actsAsOutsider(onOffering('booster') as any, slot)).toBe(false);
    expect(
      actsAsOutsider({ uuid: 'd', permissions: [] } as any, {
        ...slot,
        delegate_uuid: 'd',
      }),
    ).toBe(false);
    expect(
      actsAsOutsider({ uuid: 'w', permissions: [] } as any, {
        ...slot,
        contributor_uuid: 'w',
      }),
    ).toBe(false);
  });

  it('is nobody on a contribution that is no offering’s, or with nothing to do', () => {
    const cm = { uuid: 'cm', permissions: [] } as any;
    expect(actsAsOutsider(cm, { ...slot, is_per_offering: false })).toBe(false);
    expect(
      actsAsOutsider(cm, { ...slot, can_fill: false, can_delegate: false }),
    ).toBe(false);
    expect(actsAsOutsider(onOffering('cluster') as any, slot)).toBe(true);
  });
});

describe('ContributionActLock', () => {
  it('unlocks only once the outsider confirms whose work it is', async () => {
    const confirm = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useModal).mockReturnValue({ confirm } as any);
    const onChange = vi.fn();
    renderWithProviders(
      <ContributionActLock
        contribution={slot}
        unlocked={false}
        onChange={onChange}
      />,
    );
    expect(screen.getByTestId('contribution-locked')).toHaveTextContent(
      'Booster partition’s team’s contribution',
    );
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Unlock' }));
    expect(confirm).toHaveBeenCalledWith(
      'Act for Booster partition’s team?',
      expect.stringContaining('without asking them first'),
      { positiveButton: 'Unlock contribution' },
    );
    await waitFor(() => expect(onChange).toHaveBeenCalledWith(true));
  });

  it('keeps saying so while unlocked, and locks again', async () => {
    vi.mocked(useModal).mockReturnValue({ confirm: vi.fn() } as any);
    const onChange = vi.fn();
    renderWithProviders(
      <ContributionActLock contribution={slot} unlocked onChange={onChange} />,
    );
    expect(screen.getByTestId('contribution-unlocked')).toHaveTextContent(
      'You are acting for Booster partition’s team',
    );
    await userEvent.setup().click(screen.getByRole('button', { name: 'Lock' }));
    expect(onChange).toHaveBeenCalledWith(false);
  });
});
