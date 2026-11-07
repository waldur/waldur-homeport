import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { assignmentItemsDecline } from 'waldur-js-client';

import { useModal } from '@/modal/actions';
import { renderWithProviders } from '@/test/harness';

import { DeclineAssignmentAction } from './DeclineAssignmentAction';

const item = { uuid: 'item-1', proposal_name: 'Proposal A' } as any;

const decline = async () => {
  renderWithProviders(<DeclineAssignmentAction item={item} batchUuid="b-1" />);
  await userEvent.click(screen.getByRole('button', { name: /Decline/ }));
};

describe('DeclineAssignmentAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(assignmentItemsDecline).mockResolvedValue({ data: {} } as any);
  });

  it('asks for an optional reason', async () => {
    vi.mocked(useModal().confirm).mockResolvedValue({ input: '' } as any);
    await decline();

    expect(useModal().confirm).toHaveBeenCalledWith(
      'Decline assignment',
      expect.anything(),
      expect.objectContaining({ showInput: true, inputRequired: false }),
    );
  });

  it('sends the reason the reviewer gives', async () => {
    vi.mocked(useModal().confirm).mockResolvedValue({
      input: '  Co-author of the PI  ',
    } as any);
    await decline();

    await waitFor(() =>
      expect(assignmentItemsDecline).toHaveBeenCalledWith({
        path: { uuid: 'item-1' },
        body: { reason: 'Co-author of the PI' },
      }),
    );
  });

  it('falls back to a generic reason when none is given', async () => {
    vi.mocked(useModal().confirm).mockResolvedValue({ input: '' } as any);
    await decline();

    await waitFor(() =>
      expect(assignmentItemsDecline).toHaveBeenCalledWith({
        path: { uuid: 'item-1' },
        body: { reason: 'User declined' },
      }),
    );
  });
});
