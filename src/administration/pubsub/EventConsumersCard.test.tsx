import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  eventConsumersDestroy,
  eventConsumersRegisterWebhook,
  eventConsumersResync,
  eventConsumersUpdateWebhook,
  rabbitmqStatsRetrieve,
} from 'waldur-js-client';

import { DrawerProvider } from '@/drawer/DrawerContext';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { setTableQueryRows } from '@/table/mockTableQuery';
import { inActionsMenu, renderWithProviders } from '@/test/harness';

import { EventConsumerExpandableRow } from './EventConsumerExpandableRow';
import {
  EventConsumerDeregisterAction,
  EventConsumerResyncAction,
} from './EventConsumerRowActions';
import { EventConsumersCard } from './EventConsumersCard';
import { EventConsumerWebhookDialog } from './EventConsumerWebhookDialog';

// Serves the rows given to setTableQueryRows (none by default); no request fires.
vi.mock('@/table/useTableQuery', () => import('@/table/mockTableQuery'));
vi.mock('@/modal/useManagedMutation', () => ({
  useManagedMutation: vi.fn(),
}));

const GLOBAL_UUID = '0dc92ac0518e4604a2e27ff11120df6c';
const SCOPED_UUID = 'a4e55fc6762b446b990c390f095696c1';
const WEBHOOK_UUID = 'c7f1a2b3c4d54e6f8a9b0c1d2e3f4a5b';

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
  {
    uuid: WEBHOOK_UUID,
    object_types: ['user_role'],
    scopes: [],
    is_global: true,
    rmq_username: '',
    queue_created: false,
    delivery: 'webhook',
    webhook_destination: 'https://itsm.example.com/…',
    payload_filters: { role_name: ['CUSTOMER.OWNER'], customer_uuid: ['x'] },
    last_delivered_at: '2026-08-03T10:00:00Z',
    last_error: 'Listener answered HTTP 503.',
    last_error_at: '2026-08-03T11:00:00Z',
    created: '2026-08-03T00:00:00Z',
    modified: '2026-08-03T00:00:00Z',
  },
];

const mockStore = configureStore();
setTableQueryRows(consumers);
const store = mockStore({
  workspace: { user: { is_staff: true } },
  tables: {
    EventConsumers: {
      loading: false,
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
    inActionsMenu(
      <Provider store={store}>
        <DrawerProvider>
          <EventConsumersCard />
        </DrawerProvider>
      </Provider>,
    ),
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

  it('shows each consumer with one status, joined from queue stats', async () => {
    renderCard();
    await userEvent.click(screen.getByText('Event consumers'));

    expect(await screen.findAllByText('Global')).toHaveLength(2);
    expect(
      screen.getByText('RabbitMQ queue · All event types'),
    ).toBeInTheDocument();
    expect(screen.getByText('RabbitMQ queue · Orders')).toBeInTheDocument();
    expect(screen.getByText('offering')).toBeInTheDocument();
    // One client is reading the global consumer's queue.
    expect(await screen.findByText('Connected')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('shows a webhook by host and its failing state to staff', async () => {
    renderCard();
    await userEvent.click(screen.getByText('Event consumers'));

    expect(await screen.findByText('itsm.example.com')).toBeInTheDocument();
    expect(screen.getByText('Webhook · Role changes')).toBeInTheDocument();
    // The error is newer than the last success, so the consumer is failing.
    expect(screen.getByText('Failing')).toBeInTheDocument();
    expect(screen.getByText('Add webhook')).toBeInTheDocument();
  });

  it('puts webhook details in the expandable row', () => {
    renderWithProviders(
      <Provider store={store}>
        <EventConsumerExpandableRow row={consumers[2] as any} />
      </Provider>,
    );

    expect(screen.getByText('https://itsm.example.com/…')).toBeInTheDocument();
    expect(screen.getByText('role_name: CUSTOMER.OWNER')).toBeInTheDocument();
    expect(screen.getByText('customer_uuid: x')).toBeInTheDocument();
    expect(screen.getByText(/Listener answered HTTP 503/)).toBeInTheDocument();
    expect(screen.getByText('Role changes')).toBeInTheDocument();
  });

  it('wires the resync action to eventConsumersResync', async () => {
    renderWithProviders(
      inActionsMenu(
        <EventConsumerResyncAction
          row={consumers[2] as any}
          refetch={vi.fn()}
        />,
      ),
    );

    const config = vi.mocked(useManagedMutation).mock.calls[0][0] as any;
    expect(config.confirmation).toBeTruthy();
    await config.mutationFn();
    expect(eventConsumersResync).toHaveBeenCalledWith({
      path: { uuid: WEBHOOK_UUID },
    });
  });

  it('creates a global webhook consumer with the selected filters', async () => {
    renderWithProviders(
      <EventConsumerWebhookDialog resolve={{ refetch: vi.fn() }} />,
    );

    const config = vi.mocked(useManagedMutation).mock.calls[0][0] as any;
    await config.mutationFn({
      webhook_url: 'https://itsm.example.com/hook?sig=x',
      object_types: [{ value: 'user_role', label: 'user_role' }],
      role_names: [{ value: 'CUSTOMER.OWNER', label: 'Owner' }],
      scope_types: [],
    });
    expect(eventConsumersRegisterWebhook).toHaveBeenCalledWith({
      body: {
        webhook_url: 'https://itsm.example.com/hook?sig=x',
        object_types: ['user_role'],
        payload_filters: { role_name: ['CUSTOMER.OWNER'] },
        scopes: [],
      },
    });
  });

  it('keeps the current URL and unrelated filters when editing', async () => {
    renderWithProviders(
      <EventConsumerWebhookDialog
        resolve={{ consumer: consumers[2] as any, refetch: vi.fn() }}
      />,
    );

    const config = vi.mocked(useManagedMutation).mock.calls[0][0] as any;
    await config.mutationFn({
      webhook_url: '',
      object_types: [],
      role_names: [],
      scope_types: [{ value: 'customer', label: 'Organization' }],
    });
    expect(eventConsumersUpdateWebhook).toHaveBeenCalledWith({
      path: { uuid: WEBHOOK_UUID },
      body: {
        object_types: [],
        // role_name cleared, scope_type set, customer_uuid (API-only) kept.
        payload_filters: { customer_uuid: ['x'], scope_type: ['customer'] },
      },
    });
  });

  it('wires the deregister action to eventConsumersDestroy', async () => {
    renderWithProviders(
      inActionsMenu(
        <EventConsumerDeregisterAction
          row={consumers[0] as any}
          refetch={vi.fn()}
        />,
      ),
    );

    const config = vi.mocked(useManagedMutation).mock.calls[0][0] as any;
    expect(config.confirmation.options.forDeletion).toBe(true);
    await config.mutationFn();
    expect(eventConsumersDestroy).toHaveBeenCalledWith({
      path: { uuid: GLOBAL_UUID },
    });
  });
});
