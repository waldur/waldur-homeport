import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useCurrentStateAndParams } from '@uirouter/react';
import { vi, describe, expect, beforeEach, it } from 'vitest';
import { featureValues } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { useNotify } from '@/store/notify';

import { FeaturesList } from './FeaturesList';

// Mock dependencies
vi.mock('@/features/FeaturesDescription', () => ({
  FeaturesDescription: [
    {
      key: 'billing',
      description: 'Billing features',
      items: [
        {
          key: 'enabled',
          description: 'Enable billing functionality',
        },
      ],
    },
    {
      key: 'support',
      description: 'Support features',
      items: [
        {
          key: 'enabled',
          description: 'Enable support functionality',
        },
      ],
    },
  ],
}));

describe('FeaturesList', () => {
  // Setup mocks before each test
  beforeEach(() => {
    ENV.FEATURES = {
      billing: {
        enabled: true,
      },
      support: {
        enabled: false,
      },
    } as any;
    vi.clearAllMocks();
    vi.mocked(useCurrentStateAndParams).mockReturnValue({
      state: { name: 'admin-features' } as any,
      params: {},
    });
    // Mock notifications

    // Mock post function
    vi.mocked(featureValues).mockReset();
  });

  it('renders all feature sections', () => {
    render(<FeaturesList />);

    // Check if section titles are rendered
    expect(screen.getByText('Billing features')).toBeInTheDocument();
    expect(screen.getByText('Support features')).toBeInTheDocument();

    // Check if feature descriptions are rendered
    expect(
      screen.getByText('Enable billing functionality'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Enable support functionality'),
    ).toBeInTheDocument();
  });

  it('initializes form with correct values', () => {
    render(<FeaturesList />);

    // Get checkboxes
    const billingCheckbox = screen.getByTestId('billing.enabled');
    const supportCheckbox = screen.getByTestId('support.enabled');

    // Check initial values
    expect(billingCheckbox).toBeChecked();
    expect(supportCheckbox).not.toBeChecked();
  });

  it('handles successful form submission', async () => {
    render(<FeaturesList />);

    // Get checkboxes
    const billingCheckbox = screen.getByTestId('billing.enabled');
    const supportCheckbox = screen.getByTestId('support.enabled');

    // Toggle checkboxes
    await userEvent.click(billingCheckbox);
    await userEvent.click(supportCheckbox);

    // Verify new values
    expect(billingCheckbox).not.toBeChecked();
    expect(supportCheckbox).toBeChecked();

    // Submit form
    const submitButton = screen.getByRole('button', { name: /Save/i });
    await userEvent.click(submitButton);

    // Verify API call
    expect(featureValues).toHaveBeenCalledWith({
      body: {
        billing: {
          enabled: false,
        },
        support: {
          enabled: true,
        },
      },
    });

    // Verify success notification
    await waitFor(() => {
      expect(useNotify().showSuccess).toHaveBeenCalledWith(
        'Features have been updated.',
      );
    });
  });

  it('handles failed form submission', async () => {
    const error = new Error('API Error');
    vi.mocked(featureValues).mockRejectedValueOnce(error as never);

    render(<FeaturesList />);

    // Submit form
    const submitButton = screen.getByRole('button', { name: /Save/i });
    await userEvent.click(submitButton);

    // Verify error handling
    await waitFor(() => {
      expect(useNotify().showErrorResponse).toHaveBeenCalledWith(
        error,
        'Unable to update features.',
      );
    });
  });

  it('disables submit button while submitting', async () => {
    vi.mocked(featureValues).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100)) as any,
    );

    render(<FeaturesList />);

    const submitButton = screen.getByRole('button', { name: /Save/i });

    // Click submit button
    await userEvent.click(submitButton);

    // Verify button is disabled during submission
    expect(submitButton).toBeDisabled();

    // Wait for submission to complete
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });
});
