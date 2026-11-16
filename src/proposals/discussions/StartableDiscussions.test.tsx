import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  proposalStepDiscussionsOpen,
  proposalStepDiscussionsStartableList,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { StartableDiscussions } from './StartableDiscussions';

vi.mock('@/drawer/actions', () => ({
  useDrawer: () => ({ openDrawer: vi.fn(), closeDrawer: vi.fn() }),
}));

const round = {
  proposal_step_uuid: null,
  round_step_uuid: 'round-step-1',
  panel_uuid: 'panel-1',
  panel_name: 'Physics',
  call_uuid: 'call-1',
  call_name: 'Regular Access',
  call_step_uuid: 'step-1',
  step_name: 'Panel meeting',
  round_scoped: true,
  proposal_uuid: null,
  proposal_name: null,
  proposal_slug: null,
  round_uuid: 'round-1',
  round_name: 'Round 1',
  due_at: null,
};

describe('StartableDiscussions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUser).mockReturnValue({ uuid: 'user-1' } as any);
    vi.mocked(proposalStepDiscussionsOpen).mockReturnValue(
      new Promise(() => undefined),
    );
  });

  it('lists what the user could start and starts it', async () => {
    vi.mocked(proposalStepDiscussionsStartableList).mockResolvedValue({
      data: [round],
    } as any);
    renderWithProviders(<StartableDiscussions chatEnabled />);

    expect(await screen.findByText('Ready to start')).toBeInTheDocument();
    expect(screen.getByText('Round 1, Physics')).toBeInTheDocument();
    await userEvent.click(screen.getByTestId('startable-discussion-start'));
    await waitFor(() =>
      expect(proposalStepDiscussionsOpen).toHaveBeenCalledWith({
        body: { round_step_uuid: 'round-step-1', panel_uuid: 'panel-1' },
      }),
    );
  });

  it('shows nothing when there is nothing to start', async () => {
    vi.mocked(proposalStepDiscussionsStartableList).mockResolvedValue({
      data: [],
    } as any);
    const { container } = renderWithProviders(
      <StartableDiscussions chatEnabled />,
    );
    await waitFor(() =>
      expect(proposalStepDiscussionsStartableList).toHaveBeenCalled(),
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('asks nothing while Matrix chat is disabled', () => {
    renderWithProviders(<StartableDiscussions chatEnabled={false} />);
    expect(proposalStepDiscussionsStartableList).not.toHaveBeenCalled();
  });
});
