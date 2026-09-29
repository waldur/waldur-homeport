import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { marketplaceResourcesUpdateOptions } from 'waldur-js-client';

import { loadData } from '@/marketplace/resources/change-limits/utils';
import { useModal } from '@/modal/actions';
import { useNotify } from '@/store/notify';
import { renderWithProviders } from '@/test/harness';

import { UpdateResourceOptionDialog } from './UpdateResourceOptionDialog';

vi.mock(
  '@/marketplace/resources/change-limits/utils',
  async (importOriginal) => {
    const actual = await importOriginal<any>();
    return { ...actual, loadData: vi.fn() };
  },
);

vi.mock('@/marketplace/orders/actions/selectors', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return { ...actual, checkOrderCanBeApproved: vi.fn().mockReturnValue(true) };
});

const renderDialog = (props) => {
  return renderWithProviders(<UpdateResourceOptionDialog {...props} />);
};

describe('UpdateResourceOptionDialog', () => {
  it('renders dialog correctly and displays option field with initial value', () => {
    const resolve = {
      resource: { uuid: 'res-1', options: { storage: 100 } } as any,
      offering: { uuid: 'off-1' } as any,
      option: {
        name: 'storage',
        label: 'Storage capacity',
        type: 'integer',
      } as any,
      refetch: vi.fn(),
    };

    renderDialog({ resolve });

    expect(screen.getByText('Update option')).toBeInTheDocument();
    expect(screen.getByText('Storage capacity')).toBeInTheDocument();
    expect(screen.getByDisplayValue('100')).toBeInTheDocument();
  });

  it('handles successful option update submission', async () => {
    const user = userEvent.setup();
    const mockRefetch = vi.fn();
    const resolve = {
      resource: { uuid: 'res-1', options: { storage: 100 } } as any,
      offering: { uuid: 'off-1' } as any,
      option: {
        name: 'storage',
        label: 'Storage capacity',
        type: 'integer',
      } as any,
      refetch: mockRefetch,
    };

    vi.mocked(marketplaceResourcesUpdateOptions).mockResolvedValue({} as any);

    renderDialog({ resolve });

    const input = screen.getByDisplayValue('100');
    await user.clear(input);
    await user.type(input, '250');

    await user.click(screen.getByRole('button', { name: 'Update' }));

    await waitFor(() => {
      expect(marketplaceResourcesUpdateOptions).toHaveBeenCalledWith({
        path: { uuid: 'res-1' },
        body: { options: { storage: 250 } },
      });
      expect(useNotify().showSuccess).toHaveBeenCalledWith(
        'Options have been updated',
      );
      expect(useModal().closeDialog).toHaveBeenCalled();
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  it('handles error during submission', async () => {
    const user = userEvent.setup();
    const resolve = {
      resource: { uuid: 'res-1', options: { storage: 100 } } as any,
      offering: { uuid: 'off-1' } as any,
      option: {
        name: 'storage',
        label: 'Storage capacity',
        type: 'integer',
      } as any,
      refetch: vi.fn(),
    };

    const errorObj = new Error('Update failed');
    vi.mocked(marketplaceResourcesUpdateOptions).mockRejectedValue(errorObj);

    renderDialog({ resolve });

    await user.click(screen.getByRole('button', { name: 'Update' }));

    await waitFor(() => {
      expect(useNotify().showErrorResponse).toHaveBeenCalledWith(
        errorObj,
        'Unable to update options.',
      );
    });
  });

  it('renders fallback message when option name is not provided', () => {
    const resolve = {
      resource: { uuid: 'res-1', options: {} } as any,
      offering: { uuid: 'off-1' } as any,
      option: { name: '' } as any,
      refetch: vi.fn(),
    };

    renderDialog({ resolve });

    expect(
      screen.getByText(
        'There are no resource options defined in the offering.',
      ),
    ).toBeInTheDocument();
  });

  it('previews the limits and price a changed formula input orders', async () => {
    const user = userEvent.setup();
    const formula = {
      type: 'component_formula',
      label: 'Net storage',
      component_formula_config: {
        targets: [{ component_type: 'data', formula: 'input * 2' }],
      },
    };
    // Ordered before the resource option existed: the value is only in the
    // resource's order attributes.
    const resource = {
      uuid: 'res-1',
      attributes: { storage: 200 },
      options: {},
      limits: { data: 400 },
    } as any;
    vi.mocked(loadData).mockResolvedValue({
      resource,
      offering: {
        type: 'Marketplace.Basic',
        options: { order: ['storage'], options: { storage: formula } },
        resource_options: {
          order: ['storage'],
          options: {
            storage: { type: 'component_formula', label: 'Net storage' },
          },
        },
        components: [
          {
            type: 'data',
            name: 'Data',
            measured_unit: 'GB',
            billing_type: 'limit',
          },
        ],
      },
      plan: { name: 'Standard', unit: 'month', prices: { data: 0.1 } },
      limitSerializer: (v) => v,
      usages: {},
      limits: { data: 400 },
      initialValues: { limits: { data: 400 } },
      offeringLimits: {},
      concealBillingInfo: false,
    } as any);

    renderDialog({
      resolve: {
        resource,
        offering: { uuid: 'off-1' } as any,
        option: {
          name: 'storage',
          type: 'component_formula',
          label: 'Net storage',
        },
        refetch: vi.fn(),
      },
    });

    const input = await screen.findByDisplayValue('200');
    await waitFor(() => {
      expect(screen.getByText('Data')).toBeInTheDocument();
    });
    await user.clear(input);
    await user.type(input, '300');

    await waitFor(() => {
      expect(screen.getByText(/600\s*GB/)).toBeInTheDocument();
    });
    // No input for the limit itself: it follows the value.
    expect(screen.getAllByRole('spinbutton')).toHaveLength(1);

    vi.mocked(marketplaceResourcesUpdateOptions).mockResolvedValue({} as any);
    await user.click(screen.getByRole('button', { name: 'Update' }));
    await waitFor(() => {
      expect(useNotify().showSuccess).toHaveBeenCalledWith(
        'The change has been submitted as an order.',
      );
    });
  });
});
