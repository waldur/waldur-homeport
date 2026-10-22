import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useUser } from '@/workspace/hooks';

import { AuthenticationEvents } from './AuthenticationEvents';

vi.mock('@/table/useTable', () => ({ useTable: () => ({}) }));
vi.mock('@/table/Table', () => ({
  default: ({ columns }) => (
    <ul>
      {columns.filter(Boolean).map((column) => (
        <li key={column.title}>{column.title}</li>
      ))}
    </ul>
  ),
}));

const user = {
  uuid: 'user-uuid',
  url: 'https://example.com/api/users/user-uuid/',
};

const renderAs = (viewer: Record<string, unknown>) => {
  vi.mocked(useUser).mockReturnValue(viewer as any);
  render(<AuthenticationEvents user={user} />);
};

describe('AuthenticationEvents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the IP address column to staff', () => {
    renderAs({ ...user, is_staff: true });
    expect(screen.getByText('IP address')).toBeInTheDocument();
  });

  it('shows the IP address column to support', () => {
    renderAs({ ...user, is_support: true });
    expect(screen.getByText('IP address')).toBeInTheDocument();
  });

  it('hides the IP address column from an ordinary user', () => {
    renderAs({ ...user, is_staff: false, is_support: false });
    expect(screen.queryByText('IP address')).not.toBeInTheDocument();
    expect(screen.getByText('Message')).toBeInTheDocument();
  });
});
