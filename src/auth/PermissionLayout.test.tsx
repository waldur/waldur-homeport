import { render, screen } from '@testing-library/react';
import { useCurrentStateAndParams } from '@uirouter/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { isCallsSectionVisible } from '@/marketplace/serviceAccessMode';
import { useUser } from '@/workspace/hooks';

import { PermissionDataProvider, PermissionLayout } from './PermissionLayout';
import WarningBar from './WarningBar';

vi.mock('@/marketplace/serviceAccessMode', () => ({
  isCallsSectionVisible: vi.fn(() => true),
}));

const renderProfile = () =>
  render(
    <PermissionDataProvider>
      <WarningBar />
      <PermissionLayout>profile</PermissionLayout>
    </PermissionDataProvider>,
  );

describe('the banner for a user with no roles', () => {
  beforeEach(() => {
    vi.mocked(useCurrentStateAndParams).mockReturnValue({
      state: { name: 'profile.details' },
      params: {},
    } as any);
    vi.mocked(useUser).mockReturnValue({ uuid: 'u-1', permissions: [] } as any);
  });

  it('offers to apply to an open call where calls are shown', () => {
    renderProfile();
    expect(
      screen.getByText(
        /You have not been given access to an organization, project or call\./,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'apply to an open call' }),
    ).toBeInTheDocument();
  });

  it('names no call, and links none, where calls are not shown', () => {
    vi.mocked(isCallsSectionVisible).mockReturnValue(false);
    renderProfile();
    expect(
      screen.getByText(
        /You have not been given access to an organization or project\. Ask an administrator\./,
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
