import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, expect, beforeEach, it } from 'vitest';
import { featureValues } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { useNotify } from '@/store/notify';

import { TelemetrySendingCard } from './TelemetrySendingCard';

describe('TelemetrySendingCard', () => {
  beforeEach(() => {
    ENV.FEATURES = {
      deployment: { send_metrics: true, enable_disclaimer_area: true },
    } as any;
    vi.clearAllMocks();
    vi.mocked(featureValues).mockReset();
  });

  it('reflects the current feature value', () => {
    render(<TelemetrySendingCard />);
    expect(screen.getByTestId('deployment.send_metrics')).toBeChecked();
  });

  it('saves only the telemetry flag when switched off', async () => {
    vi.mocked(featureValues).mockResolvedValueOnce({} as never);
    render(<TelemetrySendingCard />);

    const toggle = screen.getByTestId('deployment.send_metrics');
    await userEvent.click(toggle);

    expect(featureValues).toHaveBeenCalledWith({
      body: { deployment: { send_metrics: false } },
    });
    await waitFor(() => expect(toggle).not.toBeChecked());
    expect(useNotify().showSuccess).toHaveBeenCalledWith(
      'Telemetry sending has been disabled.',
    );
    expect(ENV.FEATURES.deployment).toEqual({
      send_metrics: false,
      enable_disclaimer_area: true,
    });
  });

  it('keeps the previous value when saving fails', async () => {
    const error = new Error('API Error');
    vi.mocked(featureValues).mockRejectedValueOnce(error as never);
    render(<TelemetrySendingCard />);

    const toggle = screen.getByTestId('deployment.send_metrics');
    await userEvent.click(toggle);

    await waitFor(() =>
      expect(useNotify().showErrorResponse).toHaveBeenCalledWith(
        error,
        'Unable to update telemetry sending.',
      ),
    );
    expect(toggle).toBeChecked();
    expect(ENV.FEATURES.deployment.send_metrics).toBe(true);
  });
});
