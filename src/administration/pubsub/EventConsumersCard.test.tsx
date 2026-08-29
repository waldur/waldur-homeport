import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { eventConsumersDestroy, rabbitmqStatsRetrieve } from 'waldur-js-client';

import { DrawerProvider } from '@/drawer/DrawerContext';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { renderWithProviders } from '@/test/harness';

import { EventConsumerDeregisterAction } from './EventConsumerRowActions';
import { EventConsumersCard } from './EventConsumersCard';

vi.mock('@/table/useTableQuery', () => ({
  useTableQuery: () => ({
    data: undefined,
    isLoading: false,
    isFetching: false,
    error: null,
    refetch: vi.fn(),
  }),
}));
vi.mock('@/modal/useManagedMutation', () => ({
  useManagedMutation: vi.fn(),
}));

const GLOBAL_UUID = '0dc92ac0518e4604a2e27ff11120df6c';
const SCOPED_UUID = 'a4e55fc6762b446b990c390f095696c1';

const consumers = [
  {
    uuid: GLOBAL_UUID,
    object_types: [],
    scopes: [],
    is_global: true,
    rmq_username: 'rmq-global',
    queue_created: true,
    created: '2026-08-01T00:00:00Z',
    modified: '2026-08-01T00:00:00Z',
  },
  {
    uuid: SCOPED_UUID,
    object_types: ['order'],
    scopes: [
      { type: 'offering', uuid: 'bbbb2222-0000-0000-0000-000000000000' },
    ],
    is_global: false,
    rmq_username: 'rmq-scoped',
    queue_created: false,
    created: '2026-08-02T00:00:00Z',
    modified: '2026-08-02T00:00:00Z',
  },
];

const mockStore = configureStore();
const store = mockStore({
  tables: {
    EventConsumers: {
      loading: false,
      entities: Object.fromEntries(consumers.map((c) => [c.uuid, c])),
      order: consumers.map((c) => c.uuid),
      pagination: {
        pageSize: 10,
        resultCount: consumers.length,
        currentPage: 1,
      },
      toggled: {},
      activeColumns: {},
      columnPositions: [],
    },
  },
});

const renderCard = () =>
  renderWithProviders(
    <Provider store={store}>
      <DrawerProvider>
        <EventConsumersCard />
      </DrawerProvider>
    </Provider>,
  );

describe('EventConsumersCard', () => {
  const mutate = vi.fn();

  beforeEach(() => {
    vi.mocked(useManagedMutation).mockReturnValue({
      mutate,
      isPending: false,
    } as any);
    vi.mocked(rabbitmqStatsRetrieve).mockResolvedValue({
      data: {
        vhosts: [
          {
            name: 'vhost-1',
            user: null,
            total_messages: 7,
            queues: [
              { name: `consumer_${GLOBAL_UUID}`, messages: 7, consumers: 1 },
            ],
          },
        ],
      },
    } as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders global and scoped consumers with joined queue stats', async () => {
    renderCard();
    await userEvent.click(screen.getByText('Event consumers'));

    expect(await screen.findByText('Global')).toBeInTheDocument();
    expect(screen.getByText('All types')).toBeInTheDocument();
    expect(screen.getByText('order')).toBeInTheDocument();
    expect(screen.getByText('offering:bbbb2222')).toBeInTheDocument();
    expect(screen.getByText('Queue created')).toBeInTheDocument();
    expect(screen.getByText('Queue pending')).toBeInTheDocument();
    // Joined from RabbitMQ stats for the global consumer only.
    expect(await screen.findByText('7')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('wires the deregister action to eventConsumersDestroy', async () => {
    renderWithProviders(
      <EventConsumerDeregisterAction
        row={consumers[0] as any}
        refetch={vi.fn()}
      />,
    );

    const config = vi.mocked(useManagedMutation).mock.calls[0][0] as any;
    expect(config.confirmation.options.forDeletion).toBe(true);
    await config.mutationFn();
    expect(eventConsumersDestroy).toHaveBeenCalledWith({
      path: { uuid: GLOBAL_UUID },
    });
  });
});
