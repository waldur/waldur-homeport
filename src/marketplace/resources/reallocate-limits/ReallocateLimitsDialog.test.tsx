import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { useRouter } from '@uirouter/react';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplaceResourcesReallocateLimits } from 'waldur-js-client';

import { resourceAutocomplete } from '@/marketplace/common/autocompletes';
import { useModal } from '@/modal/actions';
import { useNotify } from '@/store/notify';

import { loadData } from '../change-limits/utils';

import { ReallocateLimitsDialog } from './ReallocateLimitsDialog';

vi.mock('@uirouter/react');
vi.mock('@/core/config', () => ({
  ENV: {
    plugins: {
      WALDUR_CORE: {
        CURRENCY_NAME: 'EUR',
      },
    },
  },
}));
vi.mock('waldur-js-client');
vi.mock('@/store/notify');
vi.mock('../change-limits/utils');
vi.mock('@/marketplace/common/autocompletes');
vi.mock('@/router', () => ({
  router: {
    urlService: {
      config: { strictMode: vi.fn() },
      rules: { initial: vi.fn() },
    },
    stateService: { go: vi.fn(), target: vi.fn() },
  },
}));

// Mock react-select-async-paginate to work with userEvent
vi.mock('react-select-async-paginate', async (importOriginal) => {
  const actual = await importOriginal<any>();
  const MockAsyncPaginate = ({
    onChange,
    value,
    isMulti,
    placeholder,
    inputId,
    loadOptions,
    ...rest
  }) => {
    const [options, setOptions] = React.useState([]);
    React.useEffect(() => {
      loadOptions('', [], { page: 1 }).then((res) => {
        if (res && res.options) {
          setOptions(res.options);
        }
      });
    }, [loadOptions]);

    return (
      <select
        id={inputId}
        data-testid={rest['data-testid'] || 'react-select'}
        multiple={isMulti}
        value={isMulti ? (value || []).map((v) => v.uuid) : value?.uuid || ''}
        onChange={(e) => {
          if (isMulti) {
            const selectedUuids = Array.from(
              e.target.selectedOptions,
              (opt) => opt.value,
            );
            onChange(options.filter((o) => selectedUuids.includes(o.uuid)));
          } else {
            onChange(options.find((o) => o.uuid === e.target.value));
          }
        }}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.uuid} value={opt.uuid}>
            {opt.name}
          </option>
        ))}
      </select>
    );
  };
  return {
    ...actual,
    AsyncPaginate: MockAsyncPaginate,
    withAsyncPaginate: () => MockAsyncPaginate,
  };
});

const mockStore = configureStore();

const renderDialog = (store, resolve) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ReallocateLimitsDialog resolve={resolve} />
      </QueryClientProvider>
    </Provider>,
  );
};

describe('ReallocateLimitsDialog', () => {
  let store;
  let mockRouter;
  let mockNotify;
  let mockModal;

  const mockResource = {
    uuid: 'source-resource-uuid',
    name: 'Source Resource',
    customer_name: 'Customer A',
    project_name: 'Project A',
    limits: { cpu: 10 },
  };

  const mockOffering = {
    uuid: 'offering-uuid',
    name: 'Offering A',
    type: 'TestType',
    components: [
      {
        type: 'cpu',
        name: 'CPU',
        billing_type: 'limit',
        measured_unit: 'cores',
      },
    ],
  };

  const mockPlan = {
    uuid: 'plan-uuid',
    unit: 'month',
    prices: { cpu: 10 },
  };

  const mockFetchedData = {
    resource: mockResource,
    offering: mockOffering,
    plan: mockPlan,
    limitSerializer: (v) => v,
    usages: { cpu: 2 },
    limits: { cpu: 10 },
    initialValues: { limits: { cpu: 10 } },
    offeringLimits: { cpu: { min: 0, max: 100 } },
    concealBillingInfo: false,
  };

  beforeEach(() => {
    store = mockStore({});

    mockRouter = {
      stateService: { go: vi.fn() },
    };
    vi.mocked(useRouter).mockReturnValue(mockRouter);

    mockNotify = {
      showSuccess: vi.fn(),
      showErrorResponse: vi.fn(),
    };
    vi.mocked(useNotify).mockReturnValue(mockNotify);

    mockModal = {
      closeDialog: vi.fn(),
    };
    vi.mocked(useModal).mockReturnValue(mockModal);

    vi.mocked(loadData).mockResolvedValue(mockFetchedData as any);

    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  const getNextButtonStep0 = () =>
    screen.queryByTestId('next-button-step-0') as HTMLButtonElement;
  const getNextButtonStep1 = () =>
    screen.queryByTestId('next-button-step-1') as HTMLButtonElement;
  const getConfirmButton = () =>
    screen.queryByTestId('confirm-button') as HTMLButtonElement;

  it('verifies the full wizard flow and validations', async () => {
    renderDialog(store, {
      resource: { marketplace_resource_uuid: 'source-resource-uuid' },
    });

    // --- Step 0: Change Limits ---
    await screen.findByText('Current limit');
    const cpuInput = await waitFor(
      () => screen.getByTestId('row-cpu-input') as HTMLInputElement,
    );
    expect(cpuInput.value).toBe('10');

    // Verification: Next button disabled if no capacity freed
    expect(getNextButtonStep0().disabled).toBe(true);

    // Try to increase limit (restricted to current limit 10)
    fireEvent.change(cpuInput, { target: { value: '12' } });
    expect(cpuInput.value).toBe('10');
    expect(getNextButtonStep0().disabled).toBe(true);

    // Reduce limit to 8 (freeing 2)
    fireEvent.change(cpuInput, { target: { value: '8' } });
    expect(cpuInput.value).toBe('8');

    await waitFor(() => expect(getNextButtonStep0().disabled).toBe(false));
    // Mock target resource search BEFORE entering step 1
    const targetResource = {
      uuid: 'target-resource-uuid',
      name: 'Target Resource',
      limits: { cpu: 5 },
    };
    vi.mocked(resourceAutocomplete).mockReturnValue(() => ({
      options: [targetResource],
      hasMore: false,
    }));

    fireEvent.click(getNextButtonStep0());

    // --- Step 1: Reallocate ---
    await screen.findByText(/Find target resource/i);

    // Search and select target resource
    const select = screen.getByTestId('react-select');
    await waitFor(() =>
      expect(screen.queryByText('Target Resource')).toBeInTheDocument(),
    );
    fireEvent.change(select, { target: { value: 'target-resource-uuid' } });

    // Wait for the resource to appear in the table
    // Allocate full capacity (total 2)
    const allocationInput = (await screen.findByTestId(
      'allocation-target-resource-uuid',
    )) as HTMLInputElement;
    fireEvent.input(allocationInput, { target: { value: '2' } });
    fireEvent.change(allocationInput, { target: { value: '2' } });
    fireEvent.blur(allocationInput);
    expect(allocationInput.value).toBe('2');

    await waitFor(() => expect(getNextButtonStep1().disabled).toBe(false), {
      timeout: 2000,
    });
    fireEvent.click(getNextButtonStep1());

    // --- Step 2: Review ---
    await waitFor(
      () => {
        const sourceRow = screen.getByTestId(
          'summary-row-source-resource-uuid',
        );
        const targetRow = screen.getByTestId(
          'summary-row-target-resource-uuid',
        );
        expect(sourceRow).toHaveTextContent('Source Resource');
        expect(targetRow).toHaveTextContent('Target Resource');
        expect(within(sourceRow).getByText('-2')).toBeInTheDocument();
        expect(within(targetRow).getByText('+2')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    fireEvent.click(getConfirmButton());

    // Final Verification
    await waitFor(() => {
      expect(marketplaceResourcesReallocateLimits).toHaveBeenCalledWith({
        path: { uuid: 'source-resource-uuid' },
        body: expect.objectContaining({
          limits: { cpu: 2 },
          targets: [
            expect.objectContaining({
              resource_uuid: 'target-resource-uuid',
              allocated_limits: { cpu: 2 },
            }),
          ],
        }),
      });
    });

    expect(mockNotify.showSuccess).toHaveBeenCalled();
    expect(mockModal.closeDialog).toHaveBeenCalled();
  });

  it('shows error message if data loading fails', async () => {
    vi.mocked(loadData).mockRejectedValue(new Error('Loading error'));
    renderDialog(store, {
      resource: { marketplace_resource_uuid: 'source-resource-uuid' },
    });
    await screen.findByText('Unable to load data.');
  });

  it('prevents proceeding if not all capacity is allocated in Step 1', async () => {
    renderDialog(store, {
      resource: { marketplace_resource_uuid: 'source-resource-uuid' },
    });

    // Step 0: Reduce limit to free 2 units
    await screen.findByText('Current limit');
    const cpuInput = await screen.findByTestId('row-cpu-input');
    fireEvent.change(cpuInput, { target: { value: '8' } });
    fireEvent.click(getNextButtonStep0());

    // Step 1: Add target resource
    const targetResource = {
      uuid: 'target-resource-uuid',
      name: 'Target Resource',
      limits: { cpu: 5 },
    };
    vi.mocked(resourceAutocomplete).mockReturnValue(() => ({
      options: [targetResource],
      hasMore: false,
    }));

    await screen.findByText(/Find target resource/i);
    const select = screen.getByTestId('react-select');
    await waitFor(() =>
      expect(screen.queryByText('Target Resource')).toBeInTheDocument(),
    );
    fireEvent.change(select, { target: { value: 'target-resource-uuid' } });

    // Step 1: Allocate only 1 unit (partial allocation)
    const allocationInput = await screen.findByTestId(
      'allocation-target-resource-uuid',
    );
    fireEvent.change(allocationInput, { target: { value: '1' } });
    fireEvent.blur(allocationInput);

    // Verify: Next button should be disabled
    expect(getNextButtonStep1().disabled).toBe(true);
  });

  it('shows error notification when submission fails', async () => {
    vi.mocked(marketplaceResourcesReallocateLimits).mockRejectedValue(
      new Error('Submission failed'),
    );

    renderDialog(store, {
      resource: { marketplace_resource_uuid: 'source-resource-uuid' },
    });

    // Step 0: Reduce limit
    const cpuInput = await screen.findByTestId('row-cpu-input');
    fireEvent.change(cpuInput, { target: { value: '8' } });
    fireEvent.click(getNextButtonStep0());

    // Step 1: Add target and allocate
    const targetResource = {
      uuid: 'target-resource-uuid',
      name: 'Target Resource',
      limits: { cpu: 5 },
    };
    vi.mocked(resourceAutocomplete).mockReturnValue(() => ({
      options: [targetResource],
      hasMore: false,
    }));

    const select = await screen.findByTestId('react-select');
    fireEvent.change(select, { target: { value: 'target-resource-uuid' } });

    const allocationInput = await screen.findByTestId(
      'allocation-target-resource-uuid',
    );
    fireEvent.change(allocationInput, { target: { value: '2' } });
    fireEvent.blur(allocationInput);
    fireEvent.click(getNextButtonStep1());

    // Step 2: Confirm
    const confirmButton = await screen.findByTestId('confirm-button');
    fireEvent.click(confirmButton);

    // Verify: showErrorResponse should be called
    await waitFor(() => {
      expect(mockNotify.showErrorResponse).toHaveBeenCalled();
    });
  });
});
