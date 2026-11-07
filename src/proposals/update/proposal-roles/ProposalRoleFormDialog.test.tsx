import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  proposalProtectedCallsProposalRolesPartialUpdate,
  proposalProtectedCallsProposalRolesSet,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';
import { openAndSelectOption } from '@/test/select';

import { ProposalRoleFormDialog } from './ProposalRoleFormDialog';

const call = { uuid: 'call-uuid' } as any;

const renderDialog = (resolve: any) =>
  renderWithProviders(<ProposalRoleFormDialog resolve={resolve} />);

describe('ProposalRoleFormDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('adds a role held by one panel member, with a lead', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    vi.mocked(proposalProtectedCallsProposalRolesSet).mockResolvedValue({
      data: {},
    } as any);
    renderDialog({ call, refetch });

    await user.type(
      screen.getByRole('textbox', { name: /Name/ }),
      '  Lead rapporteur ',
    );
    await user.click(screen.getByLabelText(/Has a lead/));
    await user.click(screen.getByRole('button', { name: 'Add' }));

    await waitFor(() =>
      expect(proposalProtectedCallsProposalRolesSet).toHaveBeenCalledWith({
        path: { uuid: 'call-uuid' },
        body: {
          name: 'Lead rapporteur',
          description: '',
          eligible_from: 'call_role:panel_member',
          min_holders: 1,
          max_holders: 1,
          allows_lead: true,
        },
      }),
    );
    await waitFor(() => expect(refetch).toHaveBeenCalled());
  });

  it('sends who may hold the role', async () => {
    const user = userEvent.setup();
    vi.mocked(proposalProtectedCallsProposalRolesSet).mockResolvedValue({
      data: {},
    } as any);
    renderDialog({ call, refetch: vi.fn() });

    await user.type(screen.getByRole('textbox', { name: /Name/ }), 'Expert');
    await openAndSelectOption(user, 'Who may hold it', 'Any user');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    await waitFor(() =>
      expect(
        vi.mocked(proposalProtectedCallsProposalRolesSet).mock.lastCall[0].body
          .eligible_from,
      ).toBe('any_user'),
    );
  });

  it('refuses more required holders than allowed', async () => {
    const user = userEvent.setup();
    renderDialog({
      call,
      refetch: vi.fn(),
      role: {
        uuid: 'role-uuid',
        name: 'Rapporteur',
        eligible_from: 'call_role:panel_member',
        min_holders: 1,
        max_holders: 1,
        allows_lead: false,
      },
    });

    const required = screen.getByRole('spinbutton', {
      name: /Required holders/,
    });
    await user.clear(required);
    await user.type(required, '3');
    await user.tab();

    expect(
      await screen.findByText(
        'Cannot be more than the maximum number of holders.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Update' })).toBeDisabled();
  });

  it('updates an existing role in place, keeping no limit as null', async () => {
    const user = userEvent.setup();
    vi.mocked(
      proposalProtectedCallsProposalRolesPartialUpdate,
    ).mockResolvedValue({ data: {} } as any);
    renderDialog({
      call,
      refetch: vi.fn(),
      role: {
        uuid: 'role-uuid',
        name: 'Rapporteur',
        description: 'Reads it first',
        eligible_from: 'call_role:reviewer',
        min_holders: 2,
        max_holders: null,
        allows_lead: false,
      },
    });

    await user.click(screen.getByRole('button', { name: 'Update' }));

    await waitFor(() =>
      expect(
        proposalProtectedCallsProposalRolesPartialUpdate,
      ).toHaveBeenCalledWith({
        path: { uuid: 'call-uuid', obj_uuid: 'role-uuid' },
        body: {
          name: 'Rapporteur',
          description: 'Reads it first',
          eligible_from: 'call_role:reviewer',
          min_holders: 2,
          max_holders: null,
          allows_lead: false,
        },
      }),
    );
    expect(proposalProtectedCallsProposalRolesSet).not.toHaveBeenCalled();
  });
});
