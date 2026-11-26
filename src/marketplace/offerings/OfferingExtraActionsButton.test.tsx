import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { isFeatureVisible } from '@/features/connect';
import { renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { OfferingExtraActionsButton } from './OfferingExtraActionsButton';

vi.mock('@/features/connect', () => ({
  isFeatureVisible: vi.fn(),
}));

const offering = {
  uuid: 'offering-uuid',
  name: 'Alps HPC',
  type: 'Marketplace.SiteAgent',
  state: 'Draft',
} as any;

const openMenu = async (props = {}) => {
  renderWithProviders(
    <OfferingExtraActionsButton offering={offering} {...props} />,
  );
  await userEvent.click(screen.getByRole('button', { name: /actions/i }));
};

describe('OfferingExtraActionsButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // catalogue_only on: no order form preview, so the menu holds only what
    // the test is about.
    vi.mocked(isFeatureVisible).mockReturnValue(true);
  });

  it('offers staff to save a site-agent offering as a template', async () => {
    vi.mocked(useUser).mockReturnValue({ is_staff: true } as any);
    await openMenu();
    expect(
      await screen.findByRole('menuitem', { name: /Save as template/ }),
    ).toBeInTheDocument();
  });

  it('is not offered for another offering type', async () => {
    vi.mocked(useUser).mockReturnValue({ is_staff: true } as any);
    renderWithProviders(
      <OfferingExtraActionsButton
        offering={{ ...offering, type: 'OpenStack.Tenant' }}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: /actions/i }));
    expect(
      screen.queryByRole('menuitem', { name: /Save as template/ }),
    ).toBeNull();
  });

  it('is not offered to non-staff', () => {
    vi.mocked(useUser).mockReturnValue({ is_staff: false } as any);
    renderWithProviders(<OfferingExtraActionsButton offering={offering} />);
    // Nothing else to offer them here: no menu at all.
    expect(screen.queryByRole('button', { name: /actions/i })).toBeNull();
  });
});
