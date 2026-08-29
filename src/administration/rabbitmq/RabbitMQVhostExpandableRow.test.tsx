import { screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplaceSiteAgentConnectionStatsRetrieve } from 'waldur-js-client';

import { DrawerProvider } from '@/drawer/DrawerContext';
import { renderWithProviders } from '@/test/harness';
import * as workspaceHooks from '@/workspace/hooks';

import type { RmqQueueStats, RmqVhostStats } from './api';
import { RabbitMQVhostExpandableRow } from './RabbitMQVhostExpandableRow';

// Rows come from the mocked redux table state; no table request fires.
vi.mock('@/table/useTableQuery', () => ({
  useTableQuery: () => ({
    data: undefined,
    isLoading: false,
    isFetching: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

const mockStore = configureStore();
const makeStore = (vhostName: string, queues: RmqQueueStats[]) =>
  mockStore({
    tables: {
      [`RabbitMQQueues-${vhostName}`]: {
        loading: false,
        entities: Object.fromEntries(queues.map((q) => [q.name, q])),
        order: queues.map((q) => q.name),
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

const renderRow = (row: RmqVhostStats) =>
  renderWithProviders(
    <Provider store={makeStore(row.name, row.queues)}>
      <DrawerProvider>
        <RabbitMQVhostExpandableRow row={row} />
      </DrawerProvider>
    </Provider>,
  );

const CONSUMER_UUID = '0dc92ac0518e4604a2e27ff11120df6c';
const CONSUMER_QUEUE = `consumer_${CONSUMER_UUID}`;

const baseQueue: RmqQueueStats = {
  name: CONSUMER_QUEUE,
  messages: 3,
  messages_ready: 3,
  messages_unacknowledged: 0,
  consumers: 1,
  subscription_uuid: null,
  offering_uuid: null,
  object_type: null,
  message_ttl: null,
  max_length: null,
  max_length_bytes: null,
  expires: null,
  overflow: null,
  dead_letter_exchange: null,
  dead_letter_routing_key: null,
  max_priority: null,
  queue_mode: null,
  // The backend currently overwrites x-queue-type with its classification.
  queue_type: 'consumer',
};

const legacyQueue: RmqQueueStats = {
  ...baseQueue,
  name: 'subscription_aaaa1111_offering_bbbb2222_order',
  subscription_uuid: 'aaaa1111-0000-0000-0000-000000000000',
  offering_uuid: 'bbbb2222-0000-0000-0000-000000000000',
  object_type: 'order',
  queue_type: 'quorum',
};

const vhost = (queues: RmqQueueStats[]): RmqVhostStats =>
  ({ name: 'vhost-1', user: null, queues, total_messages: 3 }) as any;

const agentStats = {
  agents: [
    {
      uuid: 'agent-1',
      name: 'agent-slurm-1',
      offering_uuid: 'off-1',
      offering_name: 'SLURM cluster',
      version: '1.0',
      last_restarted: '2026-08-01T00:00:00Z',
      services: [],
      event_subscriptions: [],
      queues: [
        { name: CONSUMER_QUEUE, messages: 3, consumers: 1, object_type: null },
      ],
    },
  ],
  summary: {},
};

describe('RabbitMQVhostExpandableRow', () => {
  beforeEach(() => {
    vi.mocked(workspaceHooks.useUser).mockReturnValue({
      is_staff: true,
    } as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders a unified consumer queue with its owning agent offering', async () => {
    vi.mocked(marketplaceSiteAgentConnectionStatsRetrieve).mockResolvedValue({
      data: agentStats,
    } as any);

    renderRow(vhost([baseQueue]));

    // Full 41-char name, no truncation.
    expect(await screen.findByText(CONSUMER_QUEUE)).toBeInTheDocument();
    expect(screen.getByText('Consumer')).toBeInTheDocument();
    expect(
      screen.getByText(`${CONSUMER_UUID.substring(0, 8)}...`),
    ).toBeInTheDocument();
    expect(await screen.findByText('SLURM cluster')).toBeInTheDocument();
    // The clobbered queue_type must not surface as a RabbitMQ queue type.
    expect(screen.queryByText('consumer', { exact: true })).toBeNull();
  });

  it('shows a dash for a consumer queue no agent owns', async () => {
    vi.mocked(marketplaceSiteAgentConnectionStatsRetrieve).mockResolvedValue({
      data: { agents: [], summary: {} },
    } as any);

    renderRow(vhost([baseQueue]));

    expect(await screen.findByText(CONSUMER_QUEUE)).toBeInTheDocument();
    expect(screen.queryByText('SLURM cluster')).toBeNull();
  });

  it('keeps legacy subscription rows unchanged', async () => {
    vi.mocked(marketplaceSiteAgentConnectionStatsRetrieve).mockResolvedValue({
      data: { agents: [], summary: {} },
    } as any);

    renderRow(vhost([legacyQueue]));

    expect(await screen.findByText(legacyQueue.name)).toBeInTheDocument();
    expect(screen.getByText('Legacy')).toBeInTheDocument();
    expect(screen.getByText('order')).toBeInTheDocument();
    expect(screen.getByText('quorum')).toBeInTheDocument();
    expect(screen.getByText('aaaa1111...')).toBeInTheDocument();
    expect(screen.getByText('bbbb2222...')).toBeInTheDocument();
  });
});
