import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Field, useFormState } from 'react-final-form';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  proposalProposalsAttachDocument,
  proposalProposalsUpdateProjectDetails,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { ProposalSubmissionStep } from './ProposalSubmissionStep';

// Lists the fields the form counts as unsaved.
const DirtyFields = () => {
  const { dirtyFields } = useFormState({ subscription: { dirtyFields: true } });
  return (
    <span data-testid="dirty">
      {Object.keys(dirtyFields)
        .filter((field) => dirtyFields[field])
        .join(',')}
    </span>
  );
};

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
          <Field name="supporting_documentation" render={() => null} />
          <button
            type="button"
            onClick={() =>
              params.change('supporting_documentation', [{ name: 'cv.pdf' }])
            }
          >
            Attach
          </button>
          <DirtyFields />
        </>
      ),
    },
  ],
}));

vi.mock('./ProposalSidebar', () => ({
  ProposalSidebar: ({ saveAsDraft, hasUnsavedChanges }) => (
    <>
      <button type="button" onClick={saveAsDraft}>
        Save as draft
      </button>
      <span data-testid="unsaved">{String(hasUnsavedChanges)}</span>
    </>
  ),
}));

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
  beforeEach(() => vi.clearAllMocks());

  it('keeps the resource requests when the proposal is refetched', async () => {
    const { refetchProposal } = renderStep();
    await userEvent.click(screen.getByText('Fill'));
    expect(screen.getByTestId('resources')).toHaveTextContent('1');

    refetchProposal();

    // Emptied, the Resource requests step unticks until a page reload.
    expect(screen.getByTestId('resources')).toHaveTextContent('1');
  });

  it('only reports changes Save as draft would send as unsaved', async () => {
    renderStep();
    await waitFor(() =>
      expect(screen.getByLabelText('Desc')).toHaveValue('Saved description'),
    );
    expect(screen.getByTestId('unsaved')).toHaveTextContent('false');

    // Resource requests are saved by their own dialog.
    await userEvent.click(screen.getByText('Fill'));
    expect(screen.getByTestId('unsaved')).toHaveTextContent('false');

    await userEvent.type(screen.getByLabelText('Desc'), ' edited');
    expect(screen.getByTestId('unsaved')).toHaveTextContent('true');
  });

  it('keeps the resource requests after Save as draft', async () => {
    vi.mocked(proposalProposalsUpdateProjectDetails).mockResolvedValue(
      {} as any,
    );
    const { refetchProposal } = renderStep();
    await userEvent.click(screen.getByText('Fill'));
    await userEvent.type(screen.getByLabelText('Desc'), ' edited');

    await userEvent.click(screen.getByText('Save as draft'));
    await waitFor(() =>
      expect(proposalProposalsUpdateProjectDetails).toHaveBeenCalled(),
    );
    refetchProposal({ description: 'Saved description edited' });

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

  it('counts nothing Save as draft sent as unsaved', async () => {
    vi.mocked(proposalProposalsUpdateProjectDetails).mockResolvedValue(
      {} as any,
    );
    vi.mocked(proposalProposalsAttachDocument).mockResolvedValue({} as any);
    const { refetchProposal } = renderStep();
    await waitFor(() =>
      expect(screen.getByLabelText('Desc')).toHaveValue('Saved description'),
    );
    await userEvent.type(screen.getByLabelText('Desc'), ' edited');
    await userEvent.click(screen.getByText('Attach'));

    await userEvent.click(screen.getByText('Save as draft'));
    await waitFor(() =>
      expect(proposalProposalsAttachDocument).toHaveBeenCalledTimes(1),
    );
    refetchProposal({ description: 'Saved description edited' });

    expect(screen.getByTestId('dirty')).toBeEmptyDOMElement();

    // The file is on the proposal now; a second save must not attach it again.
    await userEvent.click(screen.getByText('Save as draft'));
    await waitFor(() =>
      expect(proposalProposalsUpdateProjectDetails).toHaveBeenCalledTimes(2),
    );
    expect(proposalProposalsAttachDocument).toHaveBeenCalledTimes(1);
  });
});
