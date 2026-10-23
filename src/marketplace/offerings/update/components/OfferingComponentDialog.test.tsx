import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  marketplaceProviderOfferingsCreateOfferingComponent,
  marketplaceProviderOfferingsUpdateOfferingComponent,
} from 'waldur-js-client';

import { TENANT_TYPE } from '@/openstack/constants';
import { useNotify } from '@/store/notify';
import { renderWithProviders } from '@/test/harness';
import { openAndSelectOption } from '@/test/select';

import { OfferingComponentDialog } from './OfferingComponentDialog';

const mockOffering = {
  uuid: 'offering-1',
  type: 'Marketplace.Basic',
  components: [],
};

const mockComponent = {
  uuid: 'comp-1',
  type: 'ram',
  name: 'Memory',
  billing_type: 'limit',
  measured_unit: 'GB',
  limit_period: 'month',
  limit_amount: 10,
  max_value: 64,
  min_value: 1,
  is_builtin: false,
};

const renderComponent = (resolveProps) => {
  return renderWithProviders(
    <OfferingComponentDialog
      resolve={
        {
          ...resolveProps,
          refetch: vi.fn(),
        } as any
      }
    />,
  );
};

describe('OfferingComponentDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Add mode', () => {
    it('renders correctly', () => {
      renderComponent({ offering: mockOffering });
      expect(screen.getByText('Add component')).toBeInTheDocument();
    });

    it('submits correct payload', async () => {
      const user = userEvent.setup();
      const createMutation = vi.mocked(
        marketplaceProviderOfferingsCreateOfferingComponent,
      );
      renderComponent({ offering: mockOffering });

      const internalNameInput = screen.getByLabelText(/Internal name/i);
      const displayNameInput = screen.getByLabelText(/Display name/i);
      const measuredUnitInput = screen.getByLabelText(/Measured unit/i);
      const articleCodeInput = screen.getByLabelText(/Article code/i);

      await user.type(internalNameInput, 'cpu');
      await user.type(displayNameInput, 'CPU Core');
      await user.type(measuredUnitInput, 'vCPU');
      await user.type(articleCodeInput, 'ABC-123');

      await openAndSelectOption(user, /Accounting type/i, /Usage-based/i);

      const submitButton = screen.getByRole('button', { name: 'Confirm' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(createMutation).toHaveBeenCalledWith({
          path: { uuid: 'offering-1' },
          body: expect.objectContaining({
            type: 'cpu',
            name: 'CPU Core',
            measured_unit: 'vCPU',
            article_code: 'ABC-123',
            billing_type: 'usage',
          }),
        });
      });
    });

    it('validates required fields', async () => {
      const user = userEvent.setup();
      renderComponent({ offering: mockOffering });

      const confirmButton = screen.getByRole('button', { name: 'Confirm' });
      // Initially invalid (required fields empty)
      expect(confirmButton).toBeDisabled();

      await user.type(screen.getByLabelText(/Internal name/i), 'gpu');
      await user.type(screen.getByLabelText(/Display name/i), 'GPU');
      await openAndSelectOption(user, /Accounting type/i, /Fixed price/i);

      await waitFor(() => {
        expect(confirmButton).toBeEnabled();
      });

      // Clear required field
      await user.clear(screen.getByLabelText(/Internal name/i));
      await waitFor(() => {
        expect(confirmButton).toBeDisabled();
      });
    });

    it('handles RAM unit conversion for TENANT_TYPE offering', async () => {
      const user = userEvent.setup();
      const createMutation = vi.mocked(
        marketplaceProviderOfferingsCreateOfferingComponent,
      );
      const tenantOffering = { ...mockOffering, type: TENANT_TYPE };
      renderComponent({ offering: tenantOffering });

      await user.type(screen.getByLabelText(/Internal name/i), 'ram');
      await user.type(screen.getByLabelText(/Display name/i), 'RAM');
      await openAndSelectOption(user, /Accounting type/i, /Limit-based/i);

      // Set limits in GB
      await user.type(screen.getByLabelText(/Max value/i), '10');
      await user.type(screen.getByLabelText(/Min value/i), '1');

      await user.click(screen.getByRole('button', { name: 'Confirm' }));

      await waitFor(() => {
        expect(createMutation).toHaveBeenCalledWith({
          path: { uuid: 'offering-1' },
          body: expect.objectContaining({
            type: 'ram',
            // 10 GB -> 10240 MB
            max_value: 10240,
            min_value: 1024,
          }),
        });
      });
    });

    it('displays error message on failed submission', async () => {
      const user = userEvent.setup();
      const error = {
        response: { data: { detail: 'Unique constraint failed' } },
      };
      vi.mocked(
        marketplaceProviderOfferingsCreateOfferingComponent,
      ).mockRejectedValue(error);
      renderComponent({ offering: mockOffering });

      await user.type(screen.getByLabelText(/Internal name/i), 'cpu');
      await user.type(screen.getByLabelText(/Display name/i), 'CPU');
      await openAndSelectOption(user, /Accounting type/i, /Usage-based/i);

      await user.click(screen.getByRole('button', { name: 'Confirm' }));

      await waitFor(() => {
        expect(useNotify().showErrorResponse).toHaveBeenCalledWith(
          error,
          'Unable to create billing component.',
        );
      });
    });

    it('shows/hides limit settings based on accounting type', async () => {
      const user = userEvent.setup();
      renderComponent({ offering: mockOffering });

      // Select Usage-based
      await openAndSelectOption(user, /Accounting type/i, /Usage-based/i);
      // Usage-based offers spending limits, not its own limit amount
      expect(
        screen.getByLabelText(/Customers can set spending limits/i),
      ).toBeInTheDocument();
      expect(screen.queryByLabelText(/Enable limit/i)).not.toBeInTheDocument();

      // Select Fixed price
      await openAndSelectOption(user, /Accounting type/i, /Fixed price/i);
      // Fixed price doesn't show limit settings
      expect(
        screen.queryByText(/Accounting type settings/i),
      ).not.toBeInTheDocument();

      // Select Limit-based
      await openAndSelectOption(user, /Accounting type/i, /Limit-based/i);
      // Limit-based shows limit period and values
      expect(screen.getByLabelText(/Limit period/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Max value/i)).toBeInTheDocument();
    });

    it('submits correct payload with limit period and amount', async () => {
      const user = userEvent.setup();
      const createMutation = vi.mocked(
        marketplaceProviderOfferingsCreateOfferingComponent,
      );
      renderComponent({ offering: mockOffering });

      await user.type(screen.getByLabelText(/Internal name/i), 'cpu');
      await user.type(screen.getByLabelText(/Display name/i), 'CPU Core');
      await openAndSelectOption(user, /Accounting type/i, /Limit-based/i);

      await openAndSelectOption(user, /Limit period/i, /Maximum monthly/i);
      await user.type(screen.getByLabelText(/Max value/i), '100');

      await user.click(screen.getByRole('button', { name: 'Confirm' }));

      await waitFor(() => {
        expect(createMutation).toHaveBeenCalledWith({
          path: { uuid: 'offering-1' },
          body: expect.objectContaining({
            limit_period: 'month',
            max_value: 100,
          }),
        });
      });
    });
  });

  describe('Edit mode', () => {
    it('initializes fields with component data', () => {
      renderComponent({ offering: mockOffering, component: mockComponent });
      expect(screen.getByLabelText(/Internal name/i)).toHaveValue('ram');
      expect(screen.getByLabelText(/Display name/i)).toHaveValue('Memory');
      expect(screen.getByText('Limit-based')).toBeInTheDocument();
    });

    it('initializes RAM fields with converted values for TENANT_TYPE', () => {
      const tenantOffering = { ...mockOffering, type: TENANT_TYPE };
      const ramComponent = {
        ...mockComponent,
        type: 'ram',
        max_value: 20480, // 20 GB in MB
        min_value: 1024, // 1 GB in MB
      };
      renderComponent({ offering: tenantOffering, component: ramComponent });

      expect(screen.getByLabelText(/Max value/i)).toHaveValue(20);
      expect(screen.getByLabelText(/Min value/i)).toHaveValue(1);
    });

    it('submits updated payload', async () => {
      const user = userEvent.setup();
      const updateMutation = vi.mocked(
        marketplaceProviderOfferingsUpdateOfferingComponent,
      );
      renderComponent({ offering: mockOffering, component: mockComponent });

      const displayNameInput = screen.getByLabelText(/Display name/i);
      await user.clear(displayNameInput);
      await user.type(displayNameInput, 'Fast Memory');

      const submitButton = screen.getByRole('button', { name: 'Save' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(updateMutation).toHaveBeenCalledWith({
          path: { uuid: 'offering-1' },
          body: expect.objectContaining({
            type: 'ram',
            name: 'Fast Memory',
            billing_type: 'limit',
          }),
        });
      });
    });

    // Only a one-time component can be prepaid, and the prepaid settings show
    // only for it; switching away must not send them hidden, or the backend
    // refuses the save.
    it('clears the prepaid settings when leaving the one-time type', async () => {
      const user = userEvent.setup();
      const updateMutation = vi.mocked(
        marketplaceProviderOfferingsUpdateOfferingComponent,
      );
      renderComponent({
        offering: mockOffering,
        component: {
          ...mockComponent,
          type: 'cpu',
          billing_type: 'one',
          is_prepaid: true,
          min_prepaid_duration: 3,
          max_renewal_duration: 12,
        },
      });

      await openAndSelectOption(user, /Accounting type/i, /Limit-based/i);
      await user.click(screen.getByRole('button', { name: 'Save' }));

      await waitFor(() => {
        expect(updateMutation).toHaveBeenCalledWith({
          path: { uuid: 'offering-1' },
          body: expect.objectContaining({
            billing_type: 'limit',
            is_prepaid: false,
            min_prepaid_duration: null,
            max_renewal_duration: null,
          }),
        });
      });
    });

    it('omits read-only fields for builtin components on TENANT_TYPE offering', async () => {
      const user = userEvent.setup();
      const updateMutation = vi.mocked(
        marketplaceProviderOfferingsUpdateOfferingComponent,
      );
      const tenantOffering = { ...mockOffering, type: TENANT_TYPE };
      const builtinComponent = { ...mockComponent, is_builtin: true };

      renderComponent({
        offering: tenantOffering,
        component: builtinComponent,
      });

      const limitAmountInput = screen.getByLabelText(/Max value/i);
      await user.clear(limitAmountInput);
      await user.type(limitAmountInput, '128');

      const submitButton = screen.getByRole('button', { name: 'Save' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(updateMutation).toHaveBeenCalled();
        const payload = updateMutation.mock.calls[0][0].body;
        expect(payload).not.toHaveProperty('name');
        expect(payload).not.toHaveProperty('measured_unit');
        expect(payload).not.toHaveProperty('type');
        expect(payload).toHaveProperty('max_value', 131072);
      });
      expect(screen.getByLabelText(/Display name/i)).toHaveAttribute(
        'readonly',
      );
      expect(screen.getByLabelText(/Measured unit/i)).toBeDisabled();
    });

    it('locks only the type of a builtin component on other offering types', async () => {
      const user = userEvent.setup();
      const updateMutation = vi.mocked(
        marketplaceProviderOfferingsUpdateOfferingComponent,
      );
      const vmwareOffering = { ...mockOffering, type: 'VMware.VirtualMachine' };
      const builtinComponent = { ...mockComponent, is_builtin: true };

      renderComponent({
        offering: vmwareOffering,
        component: builtinComponent,
      });

      expect(screen.getByLabelText(/Internal name/i)).toHaveAttribute(
        'readonly',
      );
      const displayNameInput = screen.getByLabelText(/Display name/i);
      expect(displayNameInput).not.toHaveAttribute('readonly');
      await user.clear(displayNameInput);
      await user.type(displayNameInput, 'Fast Memory');

      await user.click(screen.getByRole('button', { name: 'Save' }));

      await waitFor(() => {
        expect(updateMutation).toHaveBeenCalled();
        const payload = updateMutation.mock.calls[0][0].body;
        expect(payload).not.toHaveProperty('type');
        expect(payload).toHaveProperty('name', 'Fast Memory');
      });
    });
  });
  describe('Spending limits', () => {
    const usageComponent = {
      uuid: 'comp-2',
      type: 'token_cost',
      name: 'Token cost',
      billing_type: 'usage',
      measured_unit: 'EUR',
      limit_period: null,
      limit_amount: null,
      is_builtin: false,
      spending_limit_periods: {},
    };

    it('writes the ticked periods with their default and maximum', async () => {
      const user = userEvent.setup();
      const updateMutation = vi.mocked(
        marketplaceProviderOfferingsUpdateOfferingComponent,
      );
      renderComponent({ offering: mockOffering, component: usageComponent });

      await user.click(
        screen.getByLabelText(/Customers can set spending limits/i),
      );
      expect(
        screen.getAllByText('Needs the integration to report usage per day.'),
      ).toHaveLength(2);
      await user.click(screen.getByLabelText('Daily'));
      await user.click(screen.getByLabelText('Monthly'));

      await user.type(
        screen.getByLabelText('Default', {
          selector: '[name="spending_limit_periods.day.default"]',
        }),
        '20',
      );
      await user.type(
        screen.getByLabelText('Maximum', {
          selector: '[name="spending_limit_periods.day.maximum"]',
        }),
        '100',
      );

      await user.click(screen.getByRole('button', { name: 'Save' }));

      await waitFor(() => {
        expect(updateMutation).toHaveBeenCalled();
      });
      const payload = updateMutation.mock.calls[0][0].body;
      expect(payload.spending_limit_periods).toEqual({
        day: { default: 20, maximum: 100 },
        month: {},
      });
      expect(payload).not.toHaveProperty('spending_limits_enabled');
    });

    it('prefills the periods of a component that offers them', () => {
      renderComponent({
        offering: mockOffering,
        component: {
          ...usageComponent,
          spending_limit_periods: { week: { default: 50 } },
        },
      });
      expect(
        screen.getByLabelText(/Customers can set spending limits/i),
      ).toBeChecked();
      expect(screen.getByLabelText('Weekly')).toBeChecked();
      expect(screen.getByLabelText('Daily')).not.toBeChecked();
      expect(
        screen.getByLabelText('Default', {
          selector: '[name="spending_limit_periods.week.default"]',
        }),
      ).toHaveValue(50);
    });

    it('keeps Save disabled while a default exceeds its maximum', async () => {
      const user = userEvent.setup();
      renderComponent({
        offering: mockOffering,
        component: {
          ...usageComponent,
          spending_limit_periods: { month: {} },
        },
      });
      const save = screen.getByRole('button', { name: 'Save' });
      await waitFor(() => expect(save).toBeEnabled());

      await user.type(
        screen.getByLabelText('Default', {
          selector: '[name="spending_limit_periods.month.default"]',
        }),
        '200',
      );
      await user.type(
        screen.getByLabelText('Maximum', {
          selector: '[name="spending_limit_periods.month.maximum"]',
        }),
        '100',
      );
      await waitFor(() => expect(save).toBeDisabled());
      expect(
        screen.getByText('The default must not exceed the maximum.'),
      ).toBeInTheDocument();
    });

    it('keeps Save disabled while no period is ticked', async () => {
      const user = userEvent.setup();
      renderComponent({ offering: mockOffering, component: usageComponent });
      const save = screen.getByRole('button', { name: 'Save' });

      await user.click(
        screen.getByLabelText(/Customers can set spending limits/i),
      );
      await waitFor(() => expect(save).toBeDisabled());
      expect(
        screen.getByText(
          'Choose at least one period customers can set a limit for.',
        ),
      ).toBeInTheDocument();

      await user.click(screen.getByLabelText('Yearly'));
      await waitFor(() => expect(save).toBeEnabled());
    });

    it('shows a legacy usage limit read-only and lets it be cleared', async () => {
      const user = userEvent.setup();
      const updateMutation = vi.mocked(
        marketplaceProviderOfferingsUpdateOfferingComponent,
      );
      renderComponent({
        offering: mockOffering,
        component: {
          ...usageComponent,
          limit_period: 'month',
          limit_amount: 500,
        },
      });

      expect(screen.getByTestId('legacy-usage-limit')).toHaveTextContent(
        'Limit 500 per month — not enforced',
      );
      expect(screen.queryByLabelText(/Limit amount/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/Enable limit/i)).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Clear limit' }));
      expect(
        screen.queryByTestId('legacy-usage-limit'),
      ).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Save' }));
      await waitFor(() => {
        expect(updateMutation).toHaveBeenCalled();
      });
      expect(updateMutation.mock.calls[0][0].body).toMatchObject({
        limit_amount: null,
        spending_limit_periods: {},
      });
    });

    it('sends no periods for a limit-based component', async () => {
      const user = userEvent.setup();
      const updateMutation = vi.mocked(
        marketplaceProviderOfferingsUpdateOfferingComponent,
      );
      renderComponent({ offering: mockOffering, component: mockComponent });
      expect(
        screen.queryByLabelText(/Customers can set spending limits/i),
      ).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Save' }));
      await waitFor(() => {
        expect(updateMutation).toHaveBeenCalled();
      });
      expect(
        updateMutation.mock.calls[0][0].body.spending_limit_periods,
      ).toEqual({});
    });
  });
});
