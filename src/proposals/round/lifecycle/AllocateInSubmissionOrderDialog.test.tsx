import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { proposalProtectedCallsRoundsAllocateInSubmissionOrder } from 'waldur-js-client';

import { DrawerProvider } from '@/drawer/DrawerContext';
import { renderWithProviders } from '@/test/harness';

import { AllocateInSubmissionOrderDialog } from './AllocateInSubmissionOrderDialog';

const allocate = vi.mocked(
  proposalProtectedCallsRoundsAllocateInSubmissionOrder,
);
const path = { uuid: 'call-uuid', obj_uuid: 'round-uuid' };

const planRow = (name: string, planned: string, reason = '') => ({
  order: 1,
  proposal_uuid: `${name}-uuid`,
  proposal_name: name,
  proposal_slug: '',
  submitted_at: '2026-10-01T10:00:00Z',
  score: null,
  threshold: null,
  award: [{ offering_name: 'HPC', component_type: 'cpu', amount: 60 }],
  planned_outcome: planned,
  reason,
});

const preview = {
  preview: true,
  has_budget: true,
  plan: [
    planRow('Early', 'approved'),
    planRow('Late', 'declined', 'The resources of this cut-off are depleted.'),
  ],
  budgets: [
    {
      pool_uuid: 'b1',
      offering_name: 'HPC',
      component_type: 'cpu',
      round_name: null,
      offered_total: 100,
      remaining_before: 100,
      remaining_after: 40,
    },
  ],
  completed: [],
  skipped: [],
  failed: [],
};

const entry = (name: string, detail: string) => ({
  proposal_uuid: `${name}-uuid`,
  proposal_name: name,
  detail,
});

const thrown = (status: number, body: object) => ({
  ...body,
  response: { status } as Response,
  status,
  statusText: 'Bad Request',
  url: 'http://localhost/api/allocate_in_submission_order/',
});

const renderDialog = (refetch = vi.fn()) => {
  const result = renderWithProviders(
    <DrawerProvider>
      <Provider store={configureStore()({ tables: {} })}>
        <AllocateInSubmissionOrderDialog
          resolve={{
            round: { uuid: 'round-uuid', name: 'Cut-off 1' } as any,
            call: { uuid: 'call-uuid' } as any,
            refetch,
          }}
        />
      </Provider>
    </DrawerProvider>,
  );
  return result;
};

describe('AllocateInSubmissionOrderDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('previews the plan, then applies it and refreshes the budgets', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    allocate
      .mockResolvedValueOnce({ data: preview } as any)
      .mockResolvedValueOnce({
        data: {
          ...preview,
          preview: false,
          completed: [
            entry('Early', 'Completed.'),
            entry('Late', 'Completed.'),
          ],
        },
      } as any);
    const { queryClient } = renderDialog(refetch);
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');

    expect(await screen.findByText('Early')).toBeInTheDocument();
    expect(
      screen.getByText('The resources of this cut-off are depleted.'),
    ).toBeInTheDocument();
    expect(allocate).toHaveBeenCalledWith({
      path,
      body: { preview: true, on_depleted: 'decline' },
    });

    await user.click(screen.getByRole('button', { name: 'Allocate' }));

    expect(await screen.findByTestId('allocation-summary')).toHaveTextContent(
      '2 decided, 0 skipped, 0 failed.',
    );
    expect(allocate).toHaveBeenLastCalledWith({
      path,
      body: { preview: false, on_depleted: 'decline' },
    });
    expect(refetch).toHaveBeenCalled();
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ['table', 'CallResourcePools'],
    });
  });

  it('asks for a reason and forces when proposals are still before the decision', async () => {
    const user = userEvent.setup();
    allocate
      .mockRejectedValueOnce(
        thrown(400, {
          detail: '1 proposal(s) of this round have not reached the decision.',
          waiting_count: 1,
        }),
      )
      .mockResolvedValueOnce({ data: preview } as any);
    renderDialog();

    expect(await screen.findByTestId('waiting-refusal')).toBeInTheDocument();
    const previewAnyway = screen.getByRole('button', {
      name: 'Preview anyway',
    });
    expect(previewAnyway).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Allocate' })).toBeDisabled();

    await user.type(
      screen.getByLabelText(/Reason for allocating now/),
      'Board meets today',
    );
    await user.click(screen.getByRole('button', { name: 'Preview anyway' }));

    await waitFor(() =>
      expect(allocate).toHaveBeenLastCalledWith({
        path,
        body: {
          preview: true,
          on_depleted: 'decline',
          force: true,
          reason: 'Board meets today',
        },
      }),
    );
    expect(await screen.findByText('Early')).toBeInTheDocument();
  });

  it('lists the decisions that failed and those skipped', async () => {
    const user = userEvent.setup();
    allocate
      .mockResolvedValueOnce({ data: preview } as any)
      .mockResolvedValueOnce({
        data: {
          ...preview,
          preview: false,
          completed: [entry('Early', 'Completed.')],
          skipped: [
            entry('Mine', 'You are on the applicant team of this proposal.'),
          ],
          failed: [
            entry('Late', 'The award exceeds what remains of the budget.'),
          ],
        },
      } as any);
    renderDialog();

    await screen.findByText('Early');
    await user.click(screen.getByRole('button', { name: 'Allocate' }));

    expect(await screen.findByTestId('allocation-summary')).toHaveTextContent(
      '1 decided, 1 skipped, 1 failed.',
    );
    expect(
      screen.getByText(/Late: The award exceeds what remains of the budget\./),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Mine: You are on the applicant team/),
    ).toBeInTheDocument();
  });

  it('says when the round has no budget', async () => {
    allocate.mockResolvedValueOnce({
      data: { ...preview, has_budget: false, budgets: [] },
    } as any);
    renderDialog();
    expect(await screen.findByTestId('no-budget')).toBeInTheDocument();
  });
});
