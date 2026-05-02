import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, expect, beforeEach, it } from 'vitest';
import { featureValues } from 'waldur-js-client';

import { useNotify } from '@/store/notify';

import { FeaturesList } from './FeaturesList';

// Mock dependencies
vi.mock('waldur-js-client');
vi.mock('@/store/notify', () => ({
  useNotify: vi.fn().mockReturnValue({
    showSuccess: vi.fn(),
    showErrorResponse: vi.fn(),
  } as any),
}));
vi.mock('@/i18n', () => ({
  translate: (message) => message,
}));
vi.mock('@uirouter/react', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@uirouter/react')>();
  return {
    ...mod,
    useCurrentStateAndParams: vi.fn().mockReturnValue({
      state: { name: 'admin-features' },
      params: {},
    }),
    useRouter: vi.fn().mockReturnValue({
      stateService: {
        go: vi.fn(),
      },
    }),
  };
});
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
vi.mock('@/core/config', () => ({
  ENV: {
    FEATURES: {
      billing: {
        enabled: true,
      },
      support: {
        enabled: false,
      },
    },
  },
}));

describe('FeaturesList', () => {
  const mockShowSuccess = vi.fn();
  const mockShowErrorResponse = vi.fn();

  // Setup mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock notifications
    vi.mocked(useNotify).mockReturnValue({
      showError: vi.fn(),
      showSuccess: mockShowSuccess,
      showErrorResponse: mockShowErrorResponse,
    } as any);

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
      expect(mockShowSuccess).toHaveBeenCalledWith(
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
      expect(mockShowErrorResponse).toHaveBeenCalledWith(
        error,
        'Unable to update features.',
      );
    });
  });

  it('disables submit button while submitting', async () => {
    vi.mocked(featureValues).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100)),
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
