import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Field } from 'react-final-form';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { ProposalSubmissionStep } from './ProposalSubmissionStep';

// One stand-in step: fills resources_init through change(), the way the
// resource table does, and has one real input for typed text.
vi.mock('./steps', () => ({
  createProposalSteps: () => [
    {
      id: 'step-project',
      label: 'Project details',
      component: ({ params }) => (
        <>
          <button
            type="button"
            onClick={() => params.change('resources_init', [{ uuid: 'r1' }])}
          >
            Fill
          </button>
          <span data-testid="resources">
            {params.values?.resources_init?.length ?? 0}
          </span>
          <Field name="description" component="input" aria-label="Desc" />
        </>
      ),
    },
  ],
}));

vi.mock('./ProposalSidebar', () => ({ ProposalSidebar: () => null }));

const proposal = {
  uuid: 'p1',
  call_uuid: 'c1',
  state: 'draft',
  name: 'Proposal',
  description: 'Saved description',
  project_summary: 'Summary',
  science_sub_domain: null,
  can_submit: { can_submit: true, error: null },
};

const renderStep = () => {
  const ui = (p) => (
    <ProposalSubmissionStep proposal={p} refetch={vi.fn()} reviews={[]} />
  );
  const { rerender } = renderWithProviders(ui(proposal));
  // What Save as draft and a revisit both do: the proposal comes back as a
  // new object, which rebuilds the form's initialValues.
  const refetchProposal = (changes = {}) =>
    rerender(ui({ ...proposal, ...changes }));
  return { refetchProposal };
};

describe('ProposalSubmissionStep', () => {
  it('keeps the resource requests when the proposal is refetched', async () => {
    const { refetchProposal } = renderStep();
    await userEvent.click(screen.getByText('Fill'));
    expect(screen.getByTestId('resources')).toHaveTextContent('1');

    refetchProposal();

    // Emptied, the Resource requests step unticks until a page reload.
    expect(screen.getByTestId('resources')).toHaveTextContent('1');
  });

  it('keeps unsaved input when the proposal is refetched', async () => {
    const { refetchProposal } = renderStep();
    const input = screen.getByLabelText('Desc');
    await userEvent.clear(input);
    await userEvent.type(input, 'Typed, not saved');

    refetchProposal({ description: 'Changed elsewhere' });

    expect(input).toHaveValue('Typed, not saved');
  });
});
