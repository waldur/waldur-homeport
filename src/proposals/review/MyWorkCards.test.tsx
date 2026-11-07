import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { proposalMyTasksSummaryRetrieve } from 'waldur-js-client';

import { router } from '@/router';
import { renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { MyWorkCards } from './MyWorkCards';

let store: ReturnType<ReturnType<typeof configureStore>>;

const renderCards = (summary: Record<string, number>) => {
  vi.mocked(proposalMyTasksSummaryRetrieve).mockResolvedValue({
    data: { due_soon_days: 7, ...summary },
  } as any);
  return renderWithProviders(<MyWorkCards />, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    ),
  });
};

const dueFilterSet = () =>
  store
    .getActions()
    .filter(
      (action) =>
        action.payload?.table === 'MyTasks' &&
        action.payload?.item?.name === 'due',
    )
    .map((action) => action.payload.item.value);

describe('MyWorkCards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    store = configureStore()({ tables: {} });
    vi.mocked(useUser).mockReturnValue({ uuid: 'u1' } as any);
  });

  it('shows how many tasks wait, and leaves out a count of nothing', async () => {
    renderCards({ total: 5, overdue: 2, due_soon: 0 });

    expect(
      await screen.findByText('Tasks waiting for you'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('2 tasks are past their deadline'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Tasks due soon')).not.toBeInTheDocument();
  });

  it('is not shown when nothing waits', async () => {
    renderCards({ total: 0, overdue: 0, due_soon: 0 });

    await waitFor(() =>
      expect(proposalMyTasksSummaryRetrieve).toHaveBeenCalled(),
    );
    expect(screen.queryByTestId('my-work-cards')).not.toBeInTheDocument();
  });

  it('opens My tasks on exactly the tasks a card counts', async () => {
    renderCards({ total: 5, overdue: 2, due_soon: 1 });

    await userEvent.click(await screen.findByText('Overdue tasks'));
    expect(dueFilterSet()).toEqual([
      expect.objectContaining({ value: 'overdue' }),
    ]);
    expect(router.stateService.go).toHaveBeenCalledWith(
      'reviews-tasks',
      undefined,
    );

    // The card for every task clears a Due filter left on the list.
    await userEvent.click(screen.getByText('Tasks waiting for you'));
    expect(dueFilterSet().at(-1)).toBeNull();
  });
});
