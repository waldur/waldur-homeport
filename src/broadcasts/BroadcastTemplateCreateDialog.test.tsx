import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { broadcastMessageTemplatesCreate } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { BroadcastTemplateCreateDialog } from './BroadcastTemplateCreateDialog';

describe('BroadcastTemplateCreateDialog', () => {
  const mockResolve = {
    refetch: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return renderWithProviders(
      <BroadcastTemplateCreateDialog resolve={mockResolve} />,
    );
  };

  it('renders fields and handles submission', async () => {
    const user = userEvent.setup();
    vi.mocked(broadcastMessageTemplatesCreate).mockResolvedValue({} as any);
    renderComponent();

    expect(screen.getByText('Create a broadcast template')).toBeInTheDocument();

    await user.type(screen.getByLabelText(/Name/i), 'Test Template');
    await user.type(screen.getByLabelText(/Subject/i), 'Test Subject');
    await user.type(screen.getByLabelText(/Message/i), 'Test Body');

    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(broadcastMessageTemplatesCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          body: {
            name: 'Test Template',
            subject: 'Test Subject',
            body: 'Test Body',
          },
        }),
      );
      expect(mockResolve.refetch).toHaveBeenCalled();
    });
  });

  it('shows validation errors', async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(screen.getAllByText('This field is required.')).toHaveLength(3);
    });

    expect(broadcastMessageTemplatesCreate).not.toHaveBeenCalled();
  });
});
