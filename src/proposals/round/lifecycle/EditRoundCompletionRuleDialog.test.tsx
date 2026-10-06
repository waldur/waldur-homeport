import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { proposalProtectedCallsRoundsUpdate } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';
import { openAndSelectOption } from '@/test/select';

import { EditRoundCompletionRuleDialog } from './EditRoundCompletionRuleDialog';

const round = {
  uuid: 'round-uuid',
  name: 'Round 1',
  start_time: '2026-09-01T00:00:00Z',
  cutoff_time: '2026-09-30T00:00:00Z',
  review_duration_in_days: 30,
  undecided_at_round_completion: 'reject',
} as any;
const call = {
  uuid: 'call-uuid',
  undecided_at_round_completion: 'refuse',
} as any;

describe('EditRoundCompletionRuleDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(proposalProtectedCallsRoundsUpdate).mockResolvedValue({
      data: {},
    } as any);
  });

  it("clears the override to fall back on the call's rule, sending the whole round", async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    renderWithProviders(
      <EditRoundCompletionRuleDialog resolve={{ round, call, refetch }} />,
    );

    await openAndSelectOption(
      user,
      /^When the round is completed/,
      /Use the call's setting/,
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(proposalProtectedCallsRoundsUpdate).toHaveBeenCalledWith({
        path: { uuid: 'call-uuid', obj_uuid: 'round-uuid' },
        body: expect.objectContaining({
          start_time: round.start_time,
          cutoff_time: round.cutoff_time,
          review_duration_in_days: 30,
          undecided_at_round_completion: null,
        }),
      }),
    );
    await waitFor(() => expect(refetch).toHaveBeenCalled());
  });
});
