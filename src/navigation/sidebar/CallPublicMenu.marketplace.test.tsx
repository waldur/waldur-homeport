import { render, screen } from '@testing-library/react';
import { useCurrentStateAndParams } from '@uirouter/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { isFeatureVisible } from '@/features/connect';
import { getServiceAccessMode } from '@/marketplace/serviceAccessMode';
import { useReviewerProfile } from '@/reviewer/useReviewerProfile';
import { useUser } from '@/workspace/hooks';

import { CallPublicMenu } from './CallPublicMenu';

vi.mock('@/features/connect', () => ({
  isFeatureVisible: vi.fn(),
}));

vi.mock('@/marketplace/serviceAccessMode', () => ({
  getServiceAccessMode: vi.fn(),
}));

vi.mock('@/reviewer/useReviewerProfile', () => ({
  useReviewerProfile: vi.fn(),
}));

vi.mock('waldur-ui', () => ({
  SidebarMenuAccordion: ({ title, children }) => (
    <div>
      <span>{title}</span>
      {children}
    </div>
  ),
  SidebarMenuSeparator: () => null,
}));

vi.mock('./MenuItem', () => ({
  MenuItem: ({ title }) => <span>{title}</span>,
}));

const callRole = (role_name: string) => ({
  scope_type: 'call',
  scope_uuid: 'call-1',
  role_name,
});

describe('CallPublicMenu in marketplace mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCurrentStateAndParams).mockReturnValue({
      state: { name: 'profile.details' },
      params: {},
    } as any);
    vi.mocked(getServiceAccessMode).mockReturnValue('marketplace');
    vi.mocked(isFeatureVisible).mockReturnValue(true);
    vi.mocked(useReviewerProfile).mockReturnValue({ profile: null } as any);
  });

  // A reviewer-pool member holds no call role; the profile is what gives them
  // a way to their reviews.
  it('shows My reviews to a reviewer with no call role', () => {
    vi.mocked(useUser).mockReturnValue({ permissions: [] } as any);
    vi.mocked(useReviewerProfile).mockReturnValue({
      profile: { uuid: 'profile-1' },
    } as any);
    render(<CallPublicMenu />);
    expect(screen.getByText('My reviews')).toBeInTheDocument();
    expect(screen.queryByText('Access management')).not.toBeInTheDocument();
    expect(useReviewerProfile).toHaveBeenCalledWith({ enabled: true });
  });

  it('shows nothing to a user with neither a call role nor a reviewer profile', () => {
    vi.mocked(useUser).mockReturnValue({ permissions: [] } as any);
    const { container } = render(<CallPublicMenu />);
    expect(container).toBeEmptyDOMElement();
  });

  it.each(['CALL.MANAGER', 'CALL.REVIEWER', 'CALL.PANEL_MEMBER'])(
    'keeps the Access management section for %s, with one My reviews',
    (role) => {
      vi.mocked(useUser).mockReturnValue({
        permissions: [callRole(role)],
      } as any);
      render(<CallPublicMenu />);
      expect(screen.getByText('Access management')).toBeInTheDocument();
      expect(screen.getAllByText('My reviews')).toHaveLength(1);
      expect(useReviewerProfile).toHaveBeenCalledWith({ enabled: false });
    },
  );

  it('keeps the Access management section for staff without asking for a profile', () => {
    vi.mocked(useUser).mockReturnValue({
      is_staff: true,
      permissions: [],
    } as any);
    render(<CallPublicMenu />);
    expect(screen.getByText('Access management')).toBeInTheDocument();
    expect(useReviewerProfile).toHaveBeenCalledWith({ enabled: false });
  });

  it('shows nothing to a reviewer when call management is off', () => {
    vi.mocked(isFeatureVisible).mockReturnValue(false);
    vi.mocked(useUser).mockReturnValue({ permissions: [] } as any);
    vi.mocked(useReviewerProfile).mockReturnValue({
      profile: { uuid: 'profile-1' },
    } as any);
    const { container } = render(<CallPublicMenu />);
    expect(container).toBeEmptyDOMElement();
    expect(useReviewerProfile).toHaveBeenCalledWith({ enabled: false });
  });

  it.each(['both', 'calls'])(
    'does not ask for a reviewer profile in %s mode',
    (mode) => {
      vi.mocked(getServiceAccessMode).mockReturnValue(mode as any);
      vi.mocked(useUser).mockReturnValue({ permissions: [] } as any);
      render(<CallPublicMenu />);
      expect(useReviewerProfile).toHaveBeenCalledWith({ enabled: false });
    },
  );
});
