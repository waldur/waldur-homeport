import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { proposalProtectedCallsWorkflowStepsSet } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import {
  AddAwardResponseButton,
  canAddAwardResponse,
} from './AddAwardResponseButton';

const decision = {
  key: 'allocation_decision',
  is_allocation_decision: true,
} as any;
const awardResponse = { key: 'award_response' } as any;
const review = { key: 'expert_review' } as any;

const renderButton = (props = {}) =>
  renderWithProviders(
    <AddAwardResponseButton
      call={{ uuid: 'call-uuid' } as any}
      steps={[review, decision]}
      refetch={vi.fn()}
      {...props}
    />,
  );

describe('canAddAwardResponse', () => {
  it('needs an allocation decision and no award response', () => {
    expect(canAddAwardResponse([review, decision])).toBe(true);
    expect(canAddAwardResponse([review, decision, awardResponse])).toBe(false);
    expect(canAddAwardResponse([review])).toBe(false);
    expect(canAddAwardResponse(undefined)).toBe(false);
  });
});

describe('AddAwardResponseButton', () => {
  beforeEach(() => {
    vi.mocked(proposalProtectedCallsWorkflowStepsSet).mockResolvedValue({
      data: { key: 'award_response' },
    } as any);
  });

  it('adds the award response by its key', async () => {
    renderButton();
    await userEvent.click(
      await screen.findByRole('button', { name: /Add award response/i }),
    );
    await waitFor(() =>
      expect(proposalProtectedCallsWorkflowStepsSet).toHaveBeenCalledWith({
        path: { uuid: 'call-uuid' },
        body: { key: 'award_response', is_enabled: true },
      }),
    );
  });

  it('is hidden once the call has an award response', () => {
    renderButton({ steps: [review, decision, awardResponse] });
    expect(
      screen.queryByRole('button', { name: /Add award response/i }),
    ).not.toBeInTheDocument();
  });

  it('is disabled while the call cannot be changed', async () => {
    renderButton({ disabled: true, tooltip: 'The call is archived.' });
    expect(
      await screen.findByRole('button', { name: /Add award response/i }),
    ).toBeDisabled();
  });
});
