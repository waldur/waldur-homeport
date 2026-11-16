import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { proposalStepDiscussionsOpen } from 'waldur-js-client';

import { useModal } from '@/modal/actions';
import { renderWithProviders } from '@/test/harness';

import { StepDiscussionButton } from './StepDiscussionButton';

vi.mock('@/drawer/actions', () => ({
  useDrawer: () => ({ openDrawer: vi.fn(), closeDrawer: vi.fn() }),
}));
const matrix = vi.hoisted(() => ({ enabled: true }));
vi.mock('@/matrix/utils', () => ({
  isMatrixChatEnabled: () => matrix.enabled,
}));

const render = (discussion) =>
  renderWithProviders(
    <StepDiscussionButton
      discussion={discussion}
      target={{ proposal_step_uuid: 'step-1' }}
      panelName="Panel A"
    />,
  );

describe('StepDiscussionButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    matrix.enabled = true;
    vi.mocked(proposalStepDiscussionsOpen).mockReturnValue(
      new Promise(() => undefined),
    );
  });

  it('shows only the record of a closed discussion the viewer cannot reopen', () => {
    render({ uuid: 'discussion-1', state: 'closed', can_open: false });
    expect(screen.getByTestId('step-discussion-closed')).toHaveTextContent(
      'Discussion closed (Panel A)',
    );
    expect(screen.queryByTestId('step-discussion-restart')).toBeNull();
  });

  // The step runs again: its latest discussion is closed, and opening starts
  // a new one.
  it('offers a new discussion on a step running again, beside the closed one', async () => {
    render({ uuid: 'discussion-1', state: 'closed', can_open: true });
    const restart = screen.getByTestId('step-discussion-restart');
    expect(restart).toHaveTextContent('Start a new discussion (Panel A)');
    expect(screen.getByTestId('step-discussion-closed')).toHaveTextContent(
      'Previous discussion (Panel A)',
    );

    await userEvent.click(restart);
    await waitFor(() =>
      expect(proposalStepDiscussionsOpen).toHaveBeenCalledWith({
        body: { proposal_step_uuid: 'step-1' },
      }),
    );

    await userEvent.click(screen.getByTestId('step-discussion-closed'));
    expect(useModal().openDialog).toHaveBeenCalledWith(expect.anything(), {
      resolve: { discussionUuid: 'discussion-1' },
    });
  });

  // A step may keep a dormant discussion while chat is disabled.
  it('offers no start or open while Matrix chat is disabled', () => {
    matrix.enabled = false;
    for (const state of ['not_opened', 'open']) {
      const { container, unmount } = render({
        uuid: 'discussion-1',
        state,
        can_open: true,
      });
      expect(container).toBeEmptyDOMElement();
      unmount();
    }
  });

  it("still offers a closed discussion's record while Matrix chat is disabled", async () => {
    matrix.enabled = false;
    render({ uuid: 'discussion-1', state: 'closed', can_open: true });
    expect(screen.queryByTestId('step-discussion-restart')).toBeNull();
    const record = screen.getByTestId('step-discussion-closed');
    expect(record).toHaveTextContent('Discussion closed (Panel A)');
    await userEvent.click(record);
    expect(useModal().openDialog).toHaveBeenCalledWith(expect.anything(), {
      resolve: { discussionUuid: 'discussion-1' },
    });
  });
});
