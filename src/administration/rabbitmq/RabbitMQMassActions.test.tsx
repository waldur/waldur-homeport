import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useModal } from '@/modal/actions';
import { useNotify } from '@/store/notify';
import { renderWithProviders } from '@/test/harness';

import { deleteRabbitMQQueues, purgeRabbitMQQueues } from './api';
import { RabbitMQDeleteAllButton } from './RabbitMQDeleteAllButton';
import { RabbitMQPurgeAllButton } from './RabbitMQPurgeAllButton';

vi.mock('./api', () => ({
  deleteRabbitMQQueues: vi.fn(),
  purgeRabbitMQQueues: vi.fn(),
}));

const STATS = { total_queues: 3, total_messages: 12 } as any;

// confirm() with `showInput` resolves with `{ input }`: the buttons compared
// that whole object with the expected text, so no text was ever accepted.
describe.each([
  {
    name: 'Delete all queues',
    Button: RabbitMQDeleteAllButton,
    text: 'DELETE ALL',
    request: deleteRabbitMQQueues,
    body: { delete_all_subscription_queues: true },
    result: { deleted_queues: 3 },
  },
  {
    name: 'Purge all queues',
    Button: RabbitMQPurgeAllButton,
    text: 'PURGE ALL',
    request: purgeRabbitMQQueues,
    body: { purge_all_subscription_queues: true },
    result: { purged_queues: 3, purged_messages: 12 },
  },
])('$name', ({ name, Button, text, request, body, result }) => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(request).mockResolvedValue(result as any);
  });

  const click = async () => {
    renderWithProviders(<Button data={STATS} />);
    await userEvent.click(screen.getByRole('button', { name }));
  };

  it('acts once the expected text is typed', async () => {
    vi.mocked(useModal().confirm).mockResolvedValue({ input: ` ${text} ` });
    await click();
    await waitFor(() => expect(request).toHaveBeenCalledWith(body));
    expect(useNotify().showError).not.toHaveBeenCalled();
  });

  it('does nothing when the text does not match', async () => {
    vi.mocked(useModal().confirm).mockResolvedValue({ input: 'delete' });
    await click();
    await waitFor(() => expect(useNotify().showError).toHaveBeenCalled());
    expect(request).not.toHaveBeenCalled();
  });

  it('does nothing when cancelled', async () => {
    vi.mocked(useModal().confirm).mockRejectedValue(undefined);
    await click();
    expect(request).not.toHaveBeenCalled();
    expect(useNotify().showError).not.toHaveBeenCalled();
  });
});
