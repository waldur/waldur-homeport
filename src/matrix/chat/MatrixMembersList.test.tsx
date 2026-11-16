import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { MatrixMembersList } from './MatrixMembersList';

const { members } = vi.hoisted(() => ({ members: { value: [] as any[] } }));

vi.mock('./useRoomMembers', () => ({
  useRoomMembers: () => members.value,
}));

const member = (overrides) => ({
  userId: '@someone:s',
  name: 'Someone',
  membership: 'join',
  powerLevel: 0,
  ...overrides,
});

describe('MatrixMembersList', () => {
  it('names what each member of a discussion takes part as', () => {
    members.value = [
      member({
        userId: '@vera:s',
        name: 'Vera Rubin',
        powerLevel: 50,
        roleLabel: 'Panel chair',
      }),
      member({
        userId: '@carl:s',
        name: 'Carl Sagan',
        roleLabel: 'Panel member',
      }),
    ];
    renderWithProviders(<MatrixMembersList />);
    expect(screen.getByText('Panel chair')).toBeInTheDocument();
    expect(screen.getByText('Panel member')).toBeInTheDocument();
    expect(screen.queryByText('Admin')).not.toBeInTheDocument();
  });

  it("keeps a project room's admin badge", () => {
    members.value = [member({ name: 'Mart Tamm', powerLevel: 50 })];
    renderWithProviders(<MatrixMembersList />);
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });
});
