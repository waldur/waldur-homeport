import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useUser } from '@/workspace/hooks';

import { UserDetailsDialog } from './UserDetailsDialog';

vi.mock('@/features/connect', () => ({ isFeatureVisible: () => false }));
vi.mock('@/user/dashboard/UserEvents', () => ({
  UserEvents: () => <div>user events</div>,
}));
vi.mock('@/user/support/UserDetailsTable', () => ({
  UserDetailsTable: () => <div>user details</div>,
}));
vi.mock('@/user/keys/KeysList', () => ({ KeysList: () => null }));
vi.mock('@/user/UserOfferingList', () => ({ UserOfferingList: () => null }));
vi.mock('@/user/affiliations/UserAffiliationsList', () => ({
  UserAffiliationsList: () => null,
}));
vi.mock('@/user/data-access/DataAccessDialogContent', () => ({
  DataAccessDialogContent: () => null,
}));
vi.mock('./UserIdentityBridgeTab', () => ({
  UserIdentityBridgeTab: () => null,
}));

const shownUser = {
  uuid: 'shown-user',
  url: 'https://example.com/api/users/shown-user/',
  full_name: 'Shown User',
} as any;

const renderAs = (viewer: Record<string, unknown>) => {
  vi.mocked(useUser).mockReturnValue(viewer as any);
  render(<UserDetailsDialog resolve={{ user: shownUser }} />);
};

const auditLogTab = () => screen.queryByRole('tab', { name: 'Audit log' });

describe('UserDetailsDialog audit log tab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('is shown to the user themselves', () => {
    renderAs({ uuid: 'shown-user', is_staff: false, is_support: false });
    expect(auditLogTab()).toBeInTheDocument();
  });

  it('is shown to staff viewing another user', () => {
    renderAs({ uuid: 'staff-user', is_staff: true, is_support: false });
    expect(auditLogTab()).toBeInTheDocument();
  });

  it('is shown to support viewing another user', () => {
    renderAs({ uuid: 'support-user', is_staff: false, is_support: true });
    expect(auditLogTab()).toBeInTheDocument();
  });

  it('is hidden from an ordinary user viewing someone else', () => {
    renderAs({ uuid: 'other-user', is_staff: false, is_support: false });
    expect(auditLogTab()).not.toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Details' })).toBeInTheDocument();
  });
});
