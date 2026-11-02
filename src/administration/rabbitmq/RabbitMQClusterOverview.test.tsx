import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { getRabbitMQOverview, type RmqOverview } from './api';
import { RabbitMQClusterOverview } from './RabbitMQClusterOverview';

vi.mock('./api', () => ({
  getRabbitMQOverview: vi.fn(),
}));

const mockOverview: RmqOverview = {
  cluster_name: 'production-cluster',
  rabbitmq_version: '3.13.2',
  erlang_version: '26.2.5',
  node: 'rabbit@cluster-node-01.internal',
  listeners: [
    { protocol: 'amqp', port: 5672 },
    { protocol: 'http', port: 15672 },
  ],
  message_stats: {
    publish: 1500,
    publish_rate: 25.5,
    deliver: 1200,
    deliver_rate: 20.0,
    confirm: 1400,
    confirm_rate: 24.1,
    ack: 1100,
    ack_rate: 18.5,
  },
  object_totals: {
    connections: 12,
    channels: 24,
    exchanges: 8,
    queues: 16,
    consumers: 10,
  },
  queue_totals: {
    messages: 150,
    messages_ready: 145,
    messages_unacknowledged: 5,
  },
};

describe('RabbitMQClusterOverview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not fetch overview data when collapsed (lazy polling)', () => {
    renderWithProviders(<RabbitMQClusterOverview />);

    expect(screen.getByText('Cluster overview')).toBeInTheDocument();
    expect(getRabbitMQOverview).not.toHaveBeenCalled();
  });

  it('fetches and renders all 4 sections when opened', async () => {
    vi.mocked(getRabbitMQOverview).mockResolvedValue(mockOverview);
    const user = userEvent.setup();

    renderWithProviders(<RabbitMQClusterOverview />);

    const toggleButton = screen.getByRole('button', {
      name: /Cluster overview/i,
    });
    await user.click(toggleButton);

    expect(getRabbitMQOverview).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(screen.getByText('Cluster & runtime')).toBeInTheDocument();
    });

    // 1. Cluster & runtime
    expect(screen.getByText('production-cluster')).toBeInTheDocument();
    expect(
      screen.getByText('rabbit@cluster-node-01.internal'),
    ).toBeInTheDocument();
    expect(screen.getByText('3.13.2')).toBeInTheDocument();
    expect(screen.getByText('26.2.5')).toBeInTheDocument();
    expect(screen.getByText('amqp:5672')).toBeInTheDocument();
    expect(screen.getByText('http:15672')).toBeInTheDocument();

    // 2. Activity & throughput
    expect(screen.getByText('Activity & throughput')).toBeInTheDocument();
    expect(screen.getByText('25.5 /s')).toBeInTheDocument();
    expect(screen.getByText('20 /s')).toBeInTheDocument();
    expect(screen.getByText('18.5 /s')).toBeInTheDocument();
    expect(screen.getByText('24.1 /s')).toBeInTheDocument();

    // 3. Object totals
    expect(screen.getByText('Object totals')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument(); // connections
    expect(screen.getByText('24')).toBeInTheDocument(); // channels
    expect(screen.getByText('8')).toBeInTheDocument(); // exchanges
    expect(screen.getByText('16')).toBeInTheDocument(); // queues
    expect(screen.getByText('10')).toBeInTheDocument(); // consumers

    // 4. Queue totals
    expect(screen.getByText('Queue totals')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText('145')).toBeInTheDocument();
    const unacked = screen.getByText('5');
    expect(unacked).toBeInTheDocument();
    expect(unacked).toHaveClass('text-warning');
  });

  it('renders error alert when query fails and allows retrying', async () => {
    vi.mocked(getRabbitMQOverview).mockRejectedValueOnce(
      new Error('503 Service Unavailable'),
    );
    const user = userEvent.setup();

    renderWithProviders(<RabbitMQClusterOverview />);

    await user.click(screen.getByRole('button', { name: /Cluster overview/i }));

    await waitFor(() => {
      expect(
        screen.getByText('RabbitMQ service unavailable'),
      ).toBeInTheDocument();
    });

    vi.mocked(getRabbitMQOverview).mockResolvedValueOnce(mockOverview);
    const retryBtn = screen.getByRole('button', { name: /Retry/i });
    await user.click(retryBtn);

    await waitFor(() => {
      expect(screen.getByText('Cluster & runtime')).toBeInTheDocument();
    });
  });
});
