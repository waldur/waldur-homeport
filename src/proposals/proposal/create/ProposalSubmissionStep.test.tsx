import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Field, useFormState } from 'react-final-form';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  proposalProposalsAttachDocument,
  proposalProposalsUpdateProjectDetails,
} from 'waldur-js-client';

import { useNotify } from '@/store/notify';
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

// Every request of the proposal, as the shared query returns them.
const resourceRows = vi.hoisted(() => ({ current: undefined as any }));
vi.mock('@/proposals/useProposalResourceRows', () => ({
  useProposalResourceRows: () => ({ data: resourceRows.current }),
}));

// What the Project details step requires; a test sets it before rendering.
const projectStep = vi.hoisted(() => ({
  required: false,
  requiredFields: [] as string[],
}));

// One stand-in step: fills resources_init through change(), the way the
// resource table does, and has one real input for typed text. A second one
// reports whether the resource requests count as complete.
vi.mock('./steps', () => ({
  createProposalSteps: () => [
    {
      id: 'step-resource-requests',
      label: 'Resource requests',
      component: ({ params }) => (
        <span data-testid="requests-complete">
          {String(params.isCompleted)}
        </span>
      ),
    },
    {
      id: 'step-project',
      label: 'Project details',
      required: projectStep.required,
      requiredFields: projectStep.requiredFields,
      component: ({ params }) => (
        <>
          <span data-testid="project-complete">
            {String(params.isCompleted)}
          </span>
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

const slurm = {
  offering_type: 'Marketplace.SiteAgent',
  components: [{ type: 'cpu_hours', name: 'CPU hours', billing_type: 'limit' }],
  options: {
    order: ['qos'],
    options: { qos: { type: 'select_string', label: 'QoS', required: true } },
  },
};
const requestRow = (uuid: string, attributes: Record<string, unknown>) => ({
  uuid,
  requested_offering: slurm,
  limits: { cpu_hours: 1000 },
  attributes,
});

describe('ProposalSubmissionStep', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resourceRows.current = undefined;
    projectStep.required = false;
    projectStep.requiredFields = [];
  });

  it('names a file the proposal refuses and keeps it pending', async () => {
    vi.mocked(proposalProposalsUpdateProjectDetails).mockResolvedValue(
      {} as any,
    );
    const refusal = {
      status: 400,
      file: ['This file is already attached to the proposal.'],
    };
    vi.mocked(proposalProposalsAttachDocument).mockRejectedValue(refusal);
    const { showErrorResponse, showSuccess } = useNotify();
    renderStep();
    await userEvent.click(screen.getByText('Attach'));

    await userEvent.click(screen.getByText('Save as draft'));
    await waitFor(() =>
      expect(proposalProposalsAttachDocument).toHaveBeenCalledTimes(1),
    );

    await waitFor(() =>
      expect(showErrorResponse).toHaveBeenCalledWith(
        refusal,
        'cv.pdf was not attached',
      ),
    );
    // The rest of the draft was saved; the refused file is still listed as
    // unsaved for the applicant to remove.
    expect(showSuccess).toHaveBeenCalled();
    expect(screen.getByTestId('dirty')).toHaveTextContent(
      'supporting_documentation',
    );
  });

  it('fails the save when an upload breaks for another reason', async () => {
    vi.mocked(proposalProposalsUpdateProjectDetails).mockResolvedValue(
      {} as any,
    );
    const outage = { status: 500, detail: 'Internal error' };
    vi.mocked(proposalProposalsAttachDocument).mockRejectedValue(outage);
    const { showErrorResponse, showSuccess } = useNotify();
    renderStep();
    await userEvent.click(screen.getByText('Attach'));

    await userEvent.click(screen.getByText('Save as draft'));

    await waitFor(() =>
      expect(showErrorResponse).toHaveBeenCalledWith(
        outage,
        'Something went wrong',
      ),
    );
    expect(showSuccess).not.toHaveBeenCalled();
  });

  describe('a call that requires documents', () => {
    beforeEach(() => {
      projectStep.required = true;
      projectStep.requiredFields = ['supporting_documentation'];
    });

    it('completes the step with a document already on the proposal', () => {
      renderWithProviders(
        <ProposalSubmissionStep
          proposal={{
            ...proposal,
            supporting_documentation: [{ uuid: 'd1', file_name: 'cv.pdf' }],
          }}
          refetch={vi.fn()}
          reviews={[]}
        />,
      );
      expect(screen.getByTestId('project-complete')).toHaveTextContent('true');
    });

    it('leaves the step open until a file is picked or stored', async () => {
      renderWithProviders(
        <ProposalSubmissionStep
          proposal={{ ...proposal, supporting_documentation: [] }}
          refetch={vi.fn()}
          reviews={[]}
        />,
      );
      expect(screen.getByTestId('project-complete')).toHaveTextContent('false');
      await userEvent.click(screen.getByText('Attach'));
      expect(screen.getByTestId('project-complete')).toHaveTextContent('true');
    });

    it('stays complete after Save as draft moves the file to the proposal', async () => {
      vi.mocked(proposalProposalsUpdateProjectDetails).mockResolvedValue(
        {} as any,
      );
      vi.mocked(proposalProposalsAttachDocument).mockResolvedValue({} as any);
      const { refetchProposal } = renderStep();
      await userEvent.click(screen.getByText('Attach'));
      expect(screen.getByTestId('project-complete')).toHaveTextContent('true');

      await userEvent.click(screen.getByText('Save as draft'));
      await waitFor(() =>
        expect(proposalProposalsAttachDocument).toHaveBeenCalledTimes(1),
      );
      refetchProposal({
        supporting_documentation: [{ uuid: 'd1', file_name: 'cv.pdf' }],
      });

      expect(screen.getByTestId('project-complete')).toHaveTextContent('true');
    });
  });

  // waldur/waldur-homeport#129 on GitHub: the step was ticked green while a
  // request lacked its required QoS. Judged on every request — the table
  // holds one page — so one on another page counts too.
  it('is incomplete while any request lacks a required option', async () => {
    resourceRows.current = [
      requestRow('r1', { qos: 'parallel' }),
      requestRow('r2', {}),
    ];
    renderStep();
    expect(await screen.findByTestId('requests-complete')).toHaveTextContent(
      'false',
    );
  });

  it('is complete once every request answers its required options', async () => {
    resourceRows.current = [
      requestRow('r1', { qos: 'parallel' }),
      requestRow('r2', { qos: 'long' }),
    ];
    renderStep();
    expect(await screen.findByTestId('requests-complete')).toHaveTextContent(
      'true',
    );
  });

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
