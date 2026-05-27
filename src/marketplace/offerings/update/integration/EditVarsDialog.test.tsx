import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplaceProviderOfferingsUpdateIntegration } from 'waldur-js-client';

import { EditVarsDialog } from './EditVarsDialog';

vi.mock('waldur-js-client');

const fakeOffering = {
  uuid: 'offering-uuid',
  name: 'Test Offering',
  secret_options: {
    environ: [{ name: 'VAR1', value: 'VAL1' }],
  },
};

const renderDialog = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <EditVarsDialog
        resolve={
          {
            offering: fakeOffering as any,
            refetch: vi.fn(),
          } as any
        }
      />
    </QueryClientProvider>,
  );
};

describe('EditVarsDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders initial environment variables', () => {
    renderDialog();
    expect(screen.getByDisplayValue('VAR1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('VAL1')).toBeInTheDocument();
  });

  it('adds a new variable row when clicking add button', async () => {
    const user = userEvent.setup();
    renderDialog();
    const addButton = screen.getByLabelText('Add variable');
    await user.click(addButton);

    const inputs = screen.getAllByPlaceholderText('Key');
    expect(inputs.length).toBe(2);
  });

  it('removes a variable row when clicking delete button', async () => {
    const user = userEvent.setup();
    renderDialog();
    const removeButton = screen.getByRole('button', { name: '' }); // CompactActionButton with XIcon
    await user.click(removeButton);

    expect(screen.queryByDisplayValue('VAR1')).not.toBeInTheDocument();
    expect(screen.getByText('No variable defined')).toBeInTheDocument();
  });

  it('submits updated environment variables', async () => {
    const user = userEvent.setup();
    vi.mocked(marketplaceProviderOfferingsUpdateIntegration).mockResolvedValue(
      {} as any,
    );
    renderDialog();

    const keyInput = screen.getByDisplayValue('VAR1');
    await user.clear(keyInput);
    await user.type(keyInput, 'NEW_VAR');

    await user.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(
        marketplaceProviderOfferingsUpdateIntegration,
      ).toHaveBeenCalledWith({
        path: { uuid: 'offering-uuid' },
        body: expect.objectContaining({
          secret_options: expect.objectContaining({
            environ: [{ name: 'NEW_VAR', value: 'VAL1' }],
          }),
        }),
      });
    });
  });
});
