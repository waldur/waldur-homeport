import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { CallScenariosPanel } from './ChecksPanels';
import { CHECKS_POLL_MS, pollWhileRunning } from './queries';

const { state } = vi.hoisted(() => ({
  state: {
    scenarios: {} as any,
    mutate: vi.fn(),
    finished: vi.fn(),
  },
}));

vi.mock('./queries', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./queries')>()),
  useCallScenarios: () => state.scenarios,
  useRunCallScenarios: () => ({ mutate: state.mutate, isPending: false }),
  callScenariosFinished: state.finished,
}));

vi.mock('./CheckResults', () => ({
  ScenarioCounts: () => null,
  CoverageNote: () => null,
  ScenariosTable: ({ rows }) => (
    <div data-testid="results">
      {rows.map((row) => `${row.key}:${row.result?.status ?? 'none'}`)}
    </div>
  ),
}));

const description = { steps: [] } as any;

const scenarios = (overrides = {}) => ({
  isLoading: false,
  isError: false,
  dataUpdatedAt: 1,
  data: {
    status: 'idle',
    requested_at: null,
    error: null,
    template: { uuid: 'template-uuid', name: 'Benchmark', version: 1 },
    scenarios: [{ key: 'accepted', name: 'Accepted', description: '' }],
    version: 2,
    checked_at: '2026-10-10T10:00:00Z',
    results: [{ key: 'accepted', status: 'passed' }],
    totals: { total: 1, passed: 1, failed: 0, error: 0 },
    coverage: null,
    ...overrides,
  },
});

const renderPanel = () =>
  renderWithProviders(
    <CallScenariosPanel
      callUuid="call-uuid"
      description={description}
      canRun
    />,
  );

describe('CallScenariosPanel', () => {
  beforeEach(() => {
    state.scenarios = scenarios();
    state.mutate.mockReset();
    state.finished.mockReset();
  });

  it('asks for a run with the button', async () => {
    renderPanel();
    await userEvent.click(screen.getByText('Run scenarios'));
    expect(state.mutate).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId('call-scenarios-running')).toBeNull();
  });

  it('says a run is on its way and holds the button until it is done', () => {
    state.scenarios = scenarios({
      status: 'running',
      requested_at: '2026-10-10T10:05:00Z',
    });
    renderPanel();
    expect(screen.getByTestId('call-scenarios-running')).toBeInTheDocument();
    expect(screen.queryByText('Run scenarios')).toBeNull();
    expect(screen.getByText('Running…')).toBeInTheDocument();
  });

  it('reads the paths again once a run has finished', () => {
    state.scenarios = scenarios({ status: 'running' });
    const { rerender } = renderPanel();
    expect(state.finished).not.toHaveBeenCalled();
    state.scenarios = scenarios({ status: 'idle' });
    rerender(
      <CallScenariosPanel
        callUuid="call-uuid"
        description={description}
        canRun
      />,
    );
    expect(state.finished).toHaveBeenCalledTimes(1);
    expect(state.finished.mock.calls[0][1]).toBe('call-uuid');
  });

  it('says why the last run kept no results', () => {
    state.scenarios = scenarios({
      error: 'Another dry run of the call was in progress.',
    });
    renderPanel();
    expect(screen.getByTestId('call-scenarios-error')).toHaveTextContent(
      'Another dry run of the call was in progress.',
    );
    expect(screen.getByTestId('results')).toHaveTextContent('accepted:passed');
  });

  it('lists the scenarios before they have ever run', () => {
    state.scenarios = scenarios({
      version: null,
      checked_at: null,
      results: [],
      totals: null,
    });
    renderPanel();
    expect(screen.getByTestId('results')).toHaveTextContent('accepted:none');
  });
});

describe('pollWhileRunning', () => {
  it('polls only while a run is on its way', () => {
    expect(pollWhileRunning('running')).toBe(CHECKS_POLL_MS);
    expect(pollWhileRunning('idle')).toBe(false);
    expect(pollWhileRunning(undefined)).toBe(false);
  });
});
