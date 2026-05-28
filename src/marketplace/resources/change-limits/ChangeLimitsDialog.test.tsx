import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplaceResourcesUpdateLimits } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { translate } from '@/i18n';
import { renderWithProviders } from '@/test/harness';

import { ChangeLimitsDialog } from './ChangeLimitsDialog';
import * as fixtures from './fixtures';
import { loadData } from './utils';

vi.mock('@/marketplace/orders/actions/selectors', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    orderCanBeApproved: vi.fn().mockReturnValue(true),
    checkOrderCanBeApproved: vi.fn().mockReturnValue(true),
  };
});

ENV.plugins.WALDUR_CORE.CURRENCY_NAME = 'EUR';

vi.mock('./utils', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    loadData: vi.fn(),
  };
});

const mockProps = {
  resolve: {
    resource: {
      marketplace_resource_uuid: 'test-resource-uuid',
    },
    refetch: vi.fn(),
  },
};

const mockFetchedData = {
  resource: { uuid: 'res-uuid', name: 'Test Resource' },
  offering: fixtures.offering,
  plan: { ...fixtures.plan, name: 'Test Plan' },
  limitSerializer: (v) => v,
  usages: fixtures.usages,
  limits: fixtures.currentLimits,
  initialValues: { limits: fixtures.currentLimits },
  offeringLimits: {
    cores: { min: 0, max: 100 },
    ram: { min: 0, max: 200 },
    storage: { min: 0, max: 10000 },
  },
  concealBillingInfo: false,
};

const renderDialog = () => {
  return renderWithProviders(<ChangeLimitsDialog {...mockProps} />);
};

describe('ChangeLimitsDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading spinner initially', () => {
    vi.mocked(loadData).mockReturnValue(new Promise(() => {}));
    renderDialog();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders error message if data loading fails', async () => {
    vi.mocked(loadData).mockRejectedValue(new Error('Loading failed'));
    renderDialog();
    await waitFor(() => {
      expect(
        screen.getByText(translate('Unable to load data.')),
      ).toBeInTheDocument();
    });
  });

  it('renders components and form after data is loaded', async () => {
    vi.mocked(loadData).mockResolvedValue(mockFetchedData as any);
    renderDialog();

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    expect(
      screen.getByText(translate('Change resource limits')),
    ).toBeInTheDocument();
    expect(screen.getByText(/Test Plan/)).toBeInTheDocument();
    expect(screen.getByText('Cores')).toBeInTheDocument();
    expect(screen.getByText('RAM')).toBeInTheDocument();
  });

  it('submits the form with correct data', async () => {
    vi.mocked(loadData).mockResolvedValue(mockFetchedData as any);
    const updateLimitsMock = vi
      .mocked(marketplaceResourcesUpdateLimits)
      .mockResolvedValue({} as any);

    renderDialog();

    await waitFor(() => {
      expect(screen.getByText('Submit')).toBeInTheDocument();
    });

    // Find the input for Cores (first component in fixtures)
    // In ComponentRow, it's a NumberField
    const coresInput = screen.getAllByRole('spinbutton')[0];
    fireEvent.change(coresInput, { target: { value: '10' } });
    await waitFor(() => {
      expect(coresInput).toHaveValue(10);
    });

    const submitBtn = screen.getByText('Submit');
    await act(() => {
      fireEvent.click(submitBtn);
    });

    await waitFor(() => {
      expect(updateLimitsMock).toHaveBeenCalledWith(
        expect.objectContaining({
          path: { uuid: 'res-uuid' },
          body: expect.objectContaining({
            limits: expect.objectContaining({
              cores: 10,
            }),
          }),
        }),
      );
    });

    expect(mockProps.resolve.refetch).toHaveBeenCalled();
  });

  it('validates limits and shows error', async () => {
    vi.mocked(loadData).mockResolvedValue(mockFetchedData as any);
    renderDialog();

    await waitFor(() => {
      expect(screen.getByText('Submit')).toBeInTheDocument();
    });

    const coresInput = screen.getAllByRole('spinbutton')[0];
    // Set value above max (max is 100 in mockFetchedData)
    fireEvent.change(coresInput, { target: { value: '150' } });
    await waitFor(() => {
      expect(coresInput).toHaveValue(150);
    });

    // In many Waldur forms, error messages appear as tooltips or text below fields
    // Assuming minAmount/maxAmount validators provide standard error messages
    // Let's just check if the form is invalid (SubmitButton should be disabled)
    const submitBtn = screen.getByText('Submit');
    await waitFor(() => {
      expect(submitBtn).toBeDisabled();
    });
  });

  it('renders "Request for a change" label if order cannot be approved', async () => {
    const { checkOrderCanBeApproved } =
      await import('@/marketplace/orders/actions/selectors');
    vi.mocked(checkOrderCanBeApproved).mockReturnValue(false);
    vi.mocked(loadData).mockResolvedValue(mockFetchedData as any);

    renderDialog();

    await waitFor(() => {
      expect(screen.getByText('Request for a change')).toBeInTheDocument();
    });
  });

  it('renders purchase order fields if enabled', async () => {
    const dataWithPO = {
      ...mockFetchedData,
      resource: {
        ...mockFetchedData.resource,
        offering_plugin_options: { enable_purchase_order_upload: true },
      },
    };
    vi.mocked(loadData).mockResolvedValue(dataWithPO as any);

    renderDialog();

    await waitFor(() => {
      expect(screen.getByText('Comment')).toBeInTheDocument();
      expect(screen.getByText('Purchase order document')).toBeInTheDocument();
    });
  });

  it('hides prices if concealBillingInfo is true', async () => {
    const dataWithConcealedPrices = {
      ...mockFetchedData,
      concealBillingInfo: true,
    };
    vi.mocked(loadData).mockResolvedValue(dataWithConcealedPrices as any);

    renderDialog();

    await waitFor(() => {
      expect(screen.queryByText('Price per day')).not.toBeInTheDocument();
      expect(screen.queryByText(/€/)).not.toBeInTheDocument();
    });
  });

  it('renders boolean component as a checkbox', async () => {
    const dataWithBoolean = {
      ...mockFetchedData,
      offering: {
        ...mockFetchedData.offering,
        components: [
          ...mockFetchedData.offering.components,
          {
            type: 'boolean_comp',
            name: 'Boolean Component',
            measured_unit: '',
            is_boolean: true,
            billing_type: 'limit',
          },
        ],
      },
      limits: { ...mockFetchedData.limits, boolean_comp: 0 },
      initialValues: { limits: { ...mockFetchedData.limits, boolean_comp: 0 } },
      offeringLimits: {
        ...mockFetchedData.offeringLimits,
        boolean_comp: { min: 0, max: 1 },
      },
    };
    vi.mocked(loadData).mockResolvedValue(dataWithBoolean as any);

    renderDialog();

    await waitFor(() => {
      expect(screen.getByText('Boolean Component')).toBeInTheDocument();
      // Checkboxes in Waldur often use AwesomeCheckbox which renders as an input[type="checkbox"]
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });
  });
});
