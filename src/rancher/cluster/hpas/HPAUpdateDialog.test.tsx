import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { rancherHpasUpdate } from 'waldur-js-client';

import { HPAUpdateDialog } from './HPAUpdateDialog';

vi.mock('waldur-js-client');

const mockHPA = {
  uuid: 'hpa-uuid',
  name: 'original-hpa',
  description: 'original description',
  min_replicas: 1,
  max_replicas: 10,
  metrics: [
    {
      name: 'cpu',
      target: {
        type: 'Utilization',
        utilization: 50,
      },
    },
  ],
};

const renderDialog = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <HPAUpdateDialog resolve={{ hpa: mockHPA as any }} />
    </QueryClientProvider>,
  );
};

describe('HPAUpdateDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly and populates initial values', async () => {
    renderDialog();

    expect(
      await screen.findByText('Update horizontal pod autoscaler'),
    ).toBeInTheDocument();

    expect(screen.getByLabelText('Name')).toHaveValue('original-hpa');
    expect(screen.getByLabelText('Description')).toHaveValue(
      'original description',
    );
    expect(screen.getByLabelText('Min replicas')).toHaveValue(1);
    expect(screen.getByLabelText('Max replicas')).toHaveValue(10);
    expect(screen.getByText('CPU')).toBeInTheDocument();
    expect(screen.getByText('Average utilization')).toBeInTheDocument();
    expect(screen.getByLabelText('Quantity')).toHaveValue(50);
  });

  it('submits updated values', async () => {
    const user = userEvent.setup();
    renderDialog();

    // Change name
    const nameInput = await screen.findByLabelText('Name');
    await user.clear(nameInput);
    await user.type(nameInput, 'updated-hpa');

    // Change metric to Memory
    const metricSelect = await screen.findByLabelText('Metric name');
    await user.click(metricSelect);
    await user.keyboard('Memory{Enter}');

    // Change target type to Average value
    const targetTypeSelect = await screen.findByLabelText('Target type');
    await user.click(targetTypeSelect);
    await user.keyboard('Average value{Enter}');

    // Change quantity
    const quantityInput = await screen.findByLabelText('Quantity');
    await user.clear(quantityInput);
    await user.type(quantityInput, '256');

    // Submit
    const submitBtn = screen.getByRole('button', { name: /Submit/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(rancherHpasUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          path: { uuid: 'hpa-uuid' },
          body: expect.objectContaining({
            name: 'updated-hpa',
            metrics: [
              expect.objectContaining({
                name: 'memory',
                target: expect.objectContaining({
                  averageValue: '256Mi',
                }),
              }),
            ],
          }),
        }),
      );
    });
  });
});
