import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { proposalProtectedCallsPartialUpdate } from 'waldur-js-client';

import { EditFieldDialog } from '@/form/EditFieldDialog';
import { useModal } from '@/modal/actions';
import { renderWithProviders } from '@/test/harness';
import { openAndSelectOption } from '@/test/select';

import { ProposalFieldsSection } from './ProposalFieldsSection';

const row = (state: string) => ({
  field: 'project_summary',
  state,
  allowed_states: ['required', 'optional', 'hidden'],
  usage: ['applicant_form', 'reviewer_matching', 'export_import'],
});

const callWith = (state: string) =>
  ({
    uuid: 'call-uuid',
    state: 'draft',
    proposal_field_metadata: [row(state)],
  }) as any;

const renderSection = (state: string, props = {}) =>
  renderWithProviders(
    <ProposalFieldsSection
      call={callWith(state)}
      refetch={vi.fn()}
      {...props}
    />,
  );

const openDialog = async (user) => {
  await user.click(screen.getByTestId('edit-field_project_summary'));
  const { openDialog: open } = useModal();
  const [, dialogProps] = vi.mocked(open).mock.lastCall as any;
  renderWithProviders(<EditFieldDialog {...dialogProps} />);
};

const matchingBadge = () => screen.getByText('Automatic reviewer matching');

describe('ProposalFieldsSection', () => {
  it('shows one usage, the consequential one first, and counts the rest', () => {
    renderSection('optional');
    expect(screen.getByText('Automatic reviewer matching')).toBeInTheDocument();
    expect(screen.queryByText('Applicant form')).not.toBeInTheDocument();
    expect(screen.getByText('+2 more')).toBeInTheDocument();
  });

  it('names the hidden usages to the keyboard and screen readers', () => {
    renderSection('optional');
    const more = screen.getByRole('img', { name: 'Applicant form, Export' });
    expect(more).toHaveAttribute('tabindex', '0');
  });

  it('warns only when the field is not asked', () => {
    const { unmount } = renderSection('optional');
    expect(matchingBadge()).toHaveAttribute('data-variant', 'neutral');
    unmount();
    renderSection('hidden');
    expect(matchingBadge()).toHaveAttribute('data-variant', 'warning');
  });

  it('lists every usage in the dialog, warning as Not asked is picked', async () => {
    const user = userEvent.setup();
    renderSection('optional');
    await openDialog(user);
    expect(screen.getByText('Applicant form')).toBeInTheDocument();
    const dialogBadge = () =>
      screen.getAllByText('Automatic reviewer matching').at(-1);
    expect(dialogBadge()).toHaveAttribute('data-variant', 'neutral');

    await openAndSelectOption(user, /^Summary/, 'Not asked');

    expect(dialogBadge()).toHaveAttribute('data-variant', 'warning');
  });

  it('saves the picked state under the field key', async () => {
    const user = userEvent.setup();
    vi.mocked(proposalProtectedCallsPartialUpdate).mockResolvedValue({
      data: {},
    } as any);
    renderSection('optional');
    await openDialog(user);

    await openAndSelectOption(user, /^Summary/, 'Required');
    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    await waitFor(() =>
      expect(proposalProtectedCallsPartialUpdate).toHaveBeenCalledWith({
        path: { uuid: 'call-uuid' },
        body: { proposal_field_config: { field_project_summary: 'required' } },
      }),
    );
  });

  it('disables the edit button on a read-only call and says why', () => {
    renderSection('optional', { isReadOnly: true });
    const edit = screen.getByTestId('edit-field_project_summary');
    expect(edit).toBeDisabled();
    expect(edit).toHaveAccessibleDescription(
      'You do not have permission to edit this call.',
    );
  });
});
