import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { projectsDeleteUser } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import {
  RowActions,
  toProjectGrantRow,
} from './CustomerUsersListExpandableRow';

// Capture the config handed to useManagedMutation (the hook itself is covered
// by its own test) so the request the Remove action builds can be asserted.
const { captured } = vi.hoisted(() => ({ captured: { value: null as any } }));

vi.mock('@/modal/useManagedMutation', () => ({
  useManagedMutation: (config: any) => {
    captured.value = config;
    return { isPending: false, mutate: vi.fn() };
  },
}));

const customer = { uuid: 'user-uuid', full_name: 'John Doe' } as any;

// Built with the production mapping so the fixture cannot drift from the
// composite row key the subtable actually renders.
const grantRow = toProjectGrantRow({
  uuid: 'project-uuid',
  role_name: 'PROJECT.ADMIN',
  name: 'Test project',
} as any);

describe('CustomerUsersListExpandableRow row actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    captured.value = null;
  });

  it('removes the grant by the project uuid, not the composite row key', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <RowActions row={customer} project={grantRow} refetch={vi.fn()} />,
    );

    await user.click(screen.getByRole('button'));
    expect(await screen.findByText('Remove')).toBeInTheDocument();

    captured.value.mutationFn();

    expect(projectsDeleteUser).toHaveBeenCalledWith({
      path: { uuid: 'project-uuid' },
      body: { user: 'user-uuid', role: 'PROJECT.ADMIN' },
    });
  });
});
