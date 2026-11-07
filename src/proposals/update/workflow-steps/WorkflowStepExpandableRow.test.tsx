import { screen, waitFor } from '@testing-library/react';
import { FC, PropsWithChildren } from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { proposalProtectedCallsWorkflowStepKindsList } from 'waldur-js-client';

import { DrawerProvider } from '@/drawer/DrawerContext';
import { STEP_KINDS } from '@/proposals/workflow/stepKinds.fixture';
import { renderWithProviders } from '@/test/harness';

import { WorkflowStepExpandableRow } from './WorkflowStepExpandableRow';

// The shared table registers itself in the app's store.
const StoreWrapper: FC<PropsWithChildren> = ({ children }) => (
  <DrawerProvider>
    <Provider store={configureStore()({ tables: {} })}>{children}</Provider>
  </DrawerProvider>
);

const step = (overrides: Record<string, unknown>) =>
  ({
    uuid: 'step-1',
    key: 'panel_review',
    kind: 'decision',
    outcome_set: 'approval',
    completer: 'panel_member',
    transition_mode: 'automatic_on_completion',
    criteria: [],
    responsible_users: [],
    ...overrides,
  }) as any;

beforeEach(() => {
  vi.mocked(proposalProtectedCallsWorkflowStepKindsList).mockResolvedValue({
    data: STEP_KINDS,
  } as any);
});

describe('WorkflowStepExpandableRow evaluators', () => {
  it('lists the people of the step in a table with their role', async () => {
    renderWithProviders(
      <WorkflowStepExpandableRow
        row={step({
          responsible_users: [
            {
              uuid: 'u1',
              username: 'ada',
              full_name: 'Ada Lovelace',
              email: 'ada@example.org',
              is_panel_chair: true,
              is_panel_vice_chair: false,
              offerings: [],
            },
          ],
        })}
      />,
      { wrapper: StoreWrapper },
    );
    expect(screen.getByTestId('step-evaluators')).toBeInTheDocument();
    // The rows load after the first render and settle once the step
    // kinds have loaded too.
    await waitFor(() => {
      expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
      expect(screen.getByText('ada@example.org')).toBeInTheDocument();
      expect(screen.getByText('Chair')).toBeInTheDocument();
    });
  });
});

describe('WorkflowStepExpandableRow allocation timing', () => {
  it('shows allocation timing on the allocation decision', () => {
    renderWithProviders(
      <WorkflowStepExpandableRow
        row={step({
          is_allocation_decision: true,
          allocation_time: 'fixed_date',
        })}
      />,
      { wrapper: StoreWrapper },
    );
    expect(screen.getByText(/Allocation timing/)).toBeInTheDocument();
    expect(screen.getByText('Fixed date')).toBeInTheDocument();
  });

  it('leaves it out on any other decision', () => {
    renderWithProviders(<WorkflowStepExpandableRow row={step({})} />, {
      wrapper: StoreWrapper,
    });
    expect(screen.queryByText(/Allocation timing/)).not.toBeInTheDocument();
  });
});
