import { screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { marketplaceSiteAgentConnectionStatsRetrieve } from 'waldur-js-client';

import { DrawerProvider } from '@/drawer/DrawerContext';
import { setTableQueryRows } from '@/table/mockTableQuery';
import { renderWithProviders } from '@/test/harness';

import { AgentIdentityExpandableRow } from './AgentIdentityExpandableRow';

// Serves the rows given to setTableQueryRows (none by default); no request fires.
vi.mock('@/table/useTableQuery', () => import('@/table/mockTableQuery'));

const AGENT_UUID = 'agent-1';
const CONSUMER_QUEUE = 'consumer_0dc92ac0518e4604a2e27ff11120df6c';

const identity = {
  uuid: AGENT_UUID,
  name: 'agent-slurm-1',
  config_file_content: '',
  dependencies: [],
  services: [],
} as any;

const mockStore = configureStore();
const makeStore = (queues: any[]) => {
  setTableQueryRows(queues);
  return mockStore({
    tables: {
      [`AgentQueues-${AGENT_UUID}`]: {
        loading: false,
        pagination: {
          pageSize: 10,
          resultCount: queues.length,
          currentPage: 1,
        },
        toggled: {},
        activeColumns: {},
        columnPositions: [],
      },
    },
  });
};

const agentWith = (queues: any[]) => ({
  agents: [
    {
      uuid: AGENT_UUID,
      name: 'agent-slurm-1',
      offering_uuid: 'off-1',
      offering_name: 'SLURM cluster',
      version: '1.0',
      last_restarted: '2026-08-01T00:00:00Z',
      services: [],
      event_subscriptions: [],
      queues,
    },
  ],
  summary: {},
});

const renderRow = (queues: any[]) =>
  renderWithProviders(
    <Provider store={makeStore(queues)}>
      <DrawerProvider>
        <AgentIdentityExpandableRow row={identity} />
      </DrawerProvider>
    </Provider>,
  );

describe('AgentIdentityExpandableRow', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('shows the unified consumer queue with backlog and connection', async () => {
    const queues = [
      {
        name: CONSUMER_QUEUE,
        messages: 5,
        consumers: 1,
        object_type: null,
        kind: 'consumer',
      },
    ];
    vi.mocked(marketplaceSiteAgentConnectionStatsRetrieve).mockResolvedValue({
      data: agentWith(queues),
    } as any);

    renderRow(queues);

    expect(await screen.findByText('Unified consumer')).toBeInTheDocument();
    expect(screen.getByText(CONSUMER_QUEUE)).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Healthy')).toBeInTheDocument();
  });

  it('flags a queue nobody is draining', async () => {
    const queues = [
      {
        name: CONSUMER_QUEUE,
        messages: 12,
        consumers: 0,
        object_type: null,
        kind: 'consumer',
      },
    ];
    vi.mocked(marketplaceSiteAgentConnectionStatsRetrieve).mockResolvedValue({
      data: agentWith(queues),
    } as any);

    renderRow(queues);

    expect(await screen.findByText('Not connected')).toBeInTheDocument();
  });

  it('shows a warning when the agent has no queue', async () => {
    vi.mocked(marketplaceSiteAgentConnectionStatsRetrieve).mockResolvedValue({
      data: agentWith([]),
    } as any);

    renderRow([]);

    expect(await screen.findByText('No queue found')).toBeInTheDocument();
  });

  it('degrades gracefully when connection stats fail', async () => {
    vi.mocked(marketplaceSiteAgentConnectionStatsRetrieve).mockRejectedValue(
      new Error('503'),
    );

    renderRow([]);

    expect(
      await screen.findByText('Unable to load connection data'),
    ).toBeInTheDocument();
    // The rest of the row still renders.
    expect(screen.getByText('Services')).toBeInTheDocument();
  });
});
