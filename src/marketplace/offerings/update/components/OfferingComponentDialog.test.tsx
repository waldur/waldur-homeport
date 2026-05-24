import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import {
  marketplaceProviderOfferingsCreateOfferingComponent,
  marketplaceProviderOfferingsUpdateOfferingComponent,
} from 'waldur-js-client';

import { TENANT_TYPE } from '@/openstack/constants';
import { useNotify } from '@/store/notify';

import { OfferingComponentDialog } from './OfferingComponentDialog';

vi.mock('@/store/notify');
vi.mock('waldur-js-client', () => ({
  marketplaceProviderOfferingsCreateOfferingComponent: vi.fn(),
  marketplaceProviderOfferingsUpdateOfferingComponent: vi.fn(),
  formDataBodySerializer: vi.fn(),
}));

vi.mock('@/form/select', () => ({
  Select: (props) => (
    <select
      value={props.value?.value}
      onChange={(e) => {
        const option = props.options.find(
          (opt) => opt.value === e.target.value,
        );
        props.onChange(option);
      }}
      id={props.inputId}
      disabled={props.isDisabled}
    >
      <option value="">Select...</option>
      {props.options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  ),
}));

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
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <OfferingComponentDialog
        resolve={
          {
            ...resolveProps,
            refetch: vi.fn(),
          } as any
        }
      />
    </QueryClientProvider>,
  );
};

describe('OfferingComponentDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNotify).mockReturnValue({
      showSuccess: vi.fn(),
      showErrorResponse: vi.fn(),
    } as any);
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

      await user.type(internalNameInput, 'cpu');
      await user.type(displayNameInput, 'CPU Core');

      const selectBox = screen.getByLabelText(/Accounting type/i);
      fireEvent.change(selectBox, { target: { value: 'usage' } });

      const submitButton = screen.getByRole('button', { name: 'Confirm' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(createMutation).toHaveBeenCalledWith({
          path: { uuid: 'offering-1' },
          body: expect.objectContaining({
            type: 'cpu',
            name: 'CPU Core',
            billing_type: 'usage',
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

    it('submits updated payload', async () => {
      const updateMutation = vi.mocked(
        marketplaceProviderOfferingsUpdateOfferingComponent,
      );
      renderComponent({ offering: mockOffering, component: mockComponent });

      const displayNameInput = screen.getByLabelText(/Display name/i);
      await userEvent.clear(displayNameInput);
      await userEvent.type(displayNameInput, 'Fast Memory');

      const submitButton = screen.getByRole('button', { name: 'Save' });
      await userEvent.click(submitButton);

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

    it('omits read-only fields for builtin components on TENANT_TYPE offering', async () => {
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
      await userEvent.clear(limitAmountInput);
      await userEvent.type(limitAmountInput, '128');

      const submitButton = screen.getByRole('button', { name: 'Save' });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(updateMutation).toHaveBeenCalled();
        const payload = updateMutation.mock.calls[0][0].body;
        expect(payload).not.toHaveProperty('name');
        expect(payload).not.toHaveProperty('measured_unit');
        expect(payload).not.toHaveProperty('type');
        expect(payload).toHaveProperty('max_value', 131072);
      });
    });
  });
});
