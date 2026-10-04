import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  callProposalProjectRoleMappingsCreate,
  callProposalProjectRoleMappingsPartialUpdate,
} from 'waldur-js-client';

import { ENV } from '@/core/config';
import { useModal } from '@/modal/actions';
import { useNotify } from '@/store/notify';
import { renderWithProviders } from '@/test/harness';

import { RoleMappingFormDialog } from './RoleMappingFormDialog';

// A proposal role is needed for the create-mode required select. The shared
// config mock (test/mocks/config.js) only seeds customer/project roles, so we
// add a proposal role here. ENV is a mutable singleton, so we restore it in
// beforeEach to avoid cross-test leakage.
const proposalRole = {
  name: 'PROPOSAL.MANAGER',
  description: 'Proposal manager',
  content_type: 'proposal',
  is_active: true,
};

const renderDialog = (props: any) =>
  renderWithProviders(<RoleMappingFormDialog {...props} />);

describe('RoleMappingFormDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Ensure exactly one proposal role is present for each test.
    ENV.roles = ENV.roles.filter((r) => r.content_type !== 'proposal');
    ENV.roles.push(proposalRole as any);
  });

  it('renders create dialog with both role selects', async () => {
    renderDialog({ resolve: { call: { url: 'call-url' }, refetch: vi.fn() } });

    expect(await screen.findByText('Create role mapping')).toBeInTheDocument();
    expect(
      screen.getByText(
        'If the project role is not set, corresponding users in proposal role will not be transferred to the project.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Proposal role/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Project role/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create/i })).toBeInTheDocument();
  });

  it('renders edit dialog without the proposal role select and prefills project role', async () => {
    const mapping = {
      uuid: 'mapping-uuid',
      proposal_role: 'PROPOSAL.MANAGER',
      project_role: 'manager',
    };
    renderDialog({ resolve: { mapping, refetch: vi.fn() } });

    // The title names the proposal role by its description.
    expect(
      await screen.findByText('Edit role mapping for Proposal manager'),
    ).toBeInTheDocument();
    // Edit mode hides the proposal role select.
    expect(screen.queryByLabelText(/Proposal role/i)).not.toBeInTheDocument();
    // Project role select is prefilled and labelled by its description.
    expect(screen.getByText('Manager')).toBeInTheDocument();
    expect(screen.queryByText('manager')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Update/i })).toBeInTheDocument();
  });

  it('falls back to the role name in the title when the role is not cached', async () => {
    const mapping = {
      uuid: 'mapping-uuid',
      proposal_role: 'PROPOSAL.CUSTOM',
      project_role: null,
    };
    renderDialog({ resolve: { mapping, refetch: vi.fn() } });

    expect(
      await screen.findByText('Edit role mapping for PROPOSAL.CUSTOM'),
    ).toBeInTheDocument();
  });

  it('labels proposal roles by description, qualifying ones that collide', async () => {
    const user = userEvent.setup();
    ENV.roles.push(
      {
        name: 'PROPOSAL.MEMBER',
        description: 'Proposal member',
        content_type: 'proposal',
        is_active: true,
      } as any,
      {
        name: 'PROPOSAL.MEMBER.ACME',
        description: 'Proposal member',
        content_type: 'proposal',
        is_active: true,
      } as any,
    );
    renderDialog({ resolve: { call: { url: 'call-url' }, refetch: vi.fn() } });

    await screen.findByText('Create role mapping');
    await user.click(screen.getByLabelText(/Proposal role/i));

    expect(await screen.findByText('Proposal manager')).toBeInTheDocument();
    expect(
      screen.getByText('Proposal member (PROPOSAL.MEMBER)'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Proposal member (PROPOSAL.MEMBER.ACME)'),
    ).toBeInTheDocument();
    expect(screen.queryByText('PROPOSAL.MANAGER')).not.toBeInTheDocument();
  });

  it('keeps the submit button disabled until the required proposal role is chosen', async () => {
    const user = userEvent.setup();
    renderDialog({ resolve: { call: { url: 'call-url' }, refetch: vi.fn() } });

    await screen.findByText('Create role mapping');

    const submitBtn = screen.getByRole('button', { name: /Create/i });
    expect(submitBtn).toBeDisabled();

    // Pick the proposal role via the react-select control.
    const proposalSelect = screen.getByLabelText(/Proposal role/i);
    await user.click(proposalSelect);
    await user.click(await screen.findByText('Proposal manager'));

    await waitFor(() => expect(submitBtn).toBeEnabled());
  });

  it('submits create with the call url, selected proposal role, and null project role', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    vi.mocked(callProposalProjectRoleMappingsCreate).mockResolvedValue({
      data: { uuid: 'new-uuid' },
    } as any);

    renderDialog({ resolve: { call: { url: 'call-url' }, refetch } });

    await screen.findByText('Create role mapping');

    const proposalSelect = screen.getByLabelText(/Proposal role/i);
    await user.click(proposalSelect);
    await user.click(await screen.findByText('Proposal manager'));

    await user.click(screen.getByRole('button', { name: /Create/i }));

    await waitFor(() => {
      expect(callProposalProjectRoleMappingsCreate).toHaveBeenCalledWith({
        body: {
          call: 'call-url',
          project_role: null,
          proposal_role: 'PROPOSAL.MANAGER',
        },
      });
    });

    await waitFor(() => {
      expect(refetch).toHaveBeenCalled();
      expect(useNotify().showSuccess).toHaveBeenCalledWith(
        'Role mapping has been created',
      );
      expect(useModal().closeDialog).toHaveBeenCalled();
    });
  });

  it('submits edit with the mapping uuid and only the project role in the body', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    const mapping = {
      uuid: 'mapping-uuid',
      proposal_role: 'PROPOSAL.MANAGER',
      project_role: 'manager',
    };
    vi.mocked(callProposalProjectRoleMappingsPartialUpdate).mockResolvedValue(
      {} as any,
    );

    renderDialog({ resolve: { mapping, refetch } });

    await screen.findByText(/Edit role mapping for/i);

    await user.click(screen.getByRole('button', { name: /Update/i }));

    await waitFor(() => {
      expect(callProposalProjectRoleMappingsPartialUpdate).toHaveBeenCalledWith(
        {
          path: { uuid: 'mapping-uuid' },
          body: {
            project_role: 'manager',
          },
        },
      );
      expect(refetch).toHaveBeenCalled();
    });
  });

  it('surfaces an error response and keeps the dialog open on a 400', async () => {
    const user = userEvent.setup();
    // The component's onSubmit returns `mutateAsync(values)` without a `.catch`,
    // so a failed mutation rejects the react-final-form submit promise.
    // `useManagedMutation` already reports the error via `showErrorResponse`,
    // but the rejection still escapes as "unhandled". Swallow it so this
    // expected-error path doesn't fail the run.
    const onUnhandled = () => {};
    process.on('unhandledRejection', onUnhandled);

    vi.mocked(callProposalProjectRoleMappingsCreate).mockRejectedValue({
      response: { status: 400, data: { proposal_role: 'Invalid role' } },
    } as any);

    renderDialog({ resolve: { call: { url: 'call-url' }, refetch: vi.fn() } });

    await screen.findByText('Create role mapping');

    const proposalSelect = screen.getByLabelText(/Proposal role/i);
    await user.click(proposalSelect);
    await user.click(await screen.findByText('Proposal manager'));

    await user.click(screen.getByRole('button', { name: /Create/i }));

    await waitFor(() => {
      expect(useNotify().showErrorResponse).toHaveBeenCalledWith(
        expect.anything(),
        'Unable to create a role mapping.',
      );
    });
    // On error the managed mutation must not close the dialog.
    expect(useModal().closeDialog).not.toHaveBeenCalled();

    process.off('unhandledRejection', onUnhandled);
  });
});
