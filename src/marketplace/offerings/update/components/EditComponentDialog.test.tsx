import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplaceProviderOfferingsUpdateOfferingComponent } from 'waldur-js-client';

import { TENANT_TYPE } from '@/openstack/constants';
import { useNotify } from '@/store/notify';

import { EditComponentDialog } from './EditComponentDialog';

vi.mock('@/store/notify');
vi.mock('waldur-js-client', () => ({
  marketplaceProviderOfferingsUpdateOfferingComponent: vi.fn(),
  formDataBodySerializer: vi.fn(),
}));

vi.mock('@/modal/actions', () => ({
  useModal: () => ({
    closeDialog: vi.fn(),
  }),
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

const renderComponent = (
  offering = mockOffering,
  component = mockComponent,
) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <EditComponentDialog
        resolve={
          {
            offering,
            component,
            refetch: vi.fn(),
          } as any
        }
      />
    </QueryClientProvider>,
  );
};

describe('EditComponentDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNotify).mockReturnValue({
      showSuccess: vi.fn(),
      showErrorResponse: vi.fn(),
    } as any);
  });

  it('initializes fields with component data', () => {
    renderComponent();
    expect(screen.getByLabelText(/Internal name/i)).toHaveValue('ram');
    expect(screen.getByLabelText(/Display name/i)).toHaveValue('Memory');
    expect(screen.getByText('Limit-based')).toBeInTheDocument();
  });

  it('submits updated payload', async () => {
    const updateMutation = vi.mocked(
      marketplaceProviderOfferingsUpdateOfferingComponent,
    );
    renderComponent();

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

    renderComponent(tenantOffering, builtinComponent);

    // In this edge case, we modify limit_amount
    const limitAmountInput = screen.getByLabelText(/Max value/i); // In limit billing type
    await userEvent.clear(limitAmountInput);
    await userEvent.type(limitAmountInput, '128');

    const submitButton = screen.getByRole('button', { name: 'Save' });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(updateMutation).toHaveBeenCalled();
      const payload = updateMutation.mock.calls[0][0].body;
      // It should omit name, measured_unit, and type
      expect(payload).not.toHaveProperty('name');
      expect(payload).not.toHaveProperty('measured_unit');
      expect(payload).not.toHaveProperty('type');
      expect(payload).toHaveProperty('max_value', 131072);
    });
  });
});
