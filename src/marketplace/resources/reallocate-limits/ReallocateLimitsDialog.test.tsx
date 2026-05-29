import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  marketplaceResourcesReallocateLimits,
  marketplaceResourcesList,
} from 'waldur-js-client';

import { useModal } from '@/modal/actions';
import { useNotify } from '@/store/notify';
import { renderWithProviders } from '@/test/harness';
import { typeAndSelectOption } from '@/test/select';
import { useCustomer, useProject, useUser } from '@/workspace/hooks';

import { loadData } from '../change-limits/utils';

import { ReallocateLimitsDialog } from './ReallocateLimitsDialog';

vi.mock('../change-limits/utils');

const renderDialog = (resolve) => {
  return renderWithProviders(<ReallocateLimitsDialog resolve={resolve} />);
};

describe('ReallocateLimitsDialog', () => {
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
    vi.mocked(useUser).mockReturnValue({ is_staff: true } as any);
    vi.mocked(useCustomer).mockReturnValue({} as any);
    vi.mocked(useProject).mockReturnValue({} as any);

    vi.mocked(loadData).mockResolvedValue(mockFetchedData as any);

    vi.clearAllMocks();
  });

  const getNextButtonStep0 = () =>
    screen.queryByTestId('next-button-step-0') as HTMLButtonElement;
  const getNextButtonStep1 = () =>
    screen.queryByTestId('next-button-step-1') as HTMLButtonElement;
  const getConfirmButton = () =>
    screen.queryByTestId('confirm-button') as HTMLButtonElement;

  it('verifies the full wizard flow and validations', async () => {
    renderDialog({
      resource: { marketplace_resource_uuid: 'source-resource-uuid' },
    });
    const user = userEvent.setup();

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
      offering_name: 'Offering A',
      limits: { cpu: 5 },
    };
    vi.mocked(marketplaceResourcesList).mockResolvedValue({
      data: [targetResource],
      response: {
        headers: new Headers({
          'x-result-count': '1',
        }),
      },
    } as any);

    fireEvent.click(getNextButtonStep0());

    // --- Step 1: Reallocate ---
    await screen.findByText(/Find target resource/i);

    // Search and select target resource
    await typeAndSelectOption(
      user,
      'Find target resource(s)',
      'Target',
      /^Target Resource/,
    );

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

    expect(useNotify().showSuccess).toHaveBeenCalled();
    expect(useModal().closeDialog).toHaveBeenCalled();
  });

  it('shows error message if data loading fails', async () => {
    vi.mocked(loadData).mockRejectedValue(new Error('Loading error'));
    renderDialog({
      resource: { marketplace_resource_uuid: 'source-resource-uuid' },
    });
    await screen.findByText('Unable to load data.');
  });

  it('prevents proceeding if not all capacity is allocated in Step 1', async () => {
    renderDialog({
      resource: { marketplace_resource_uuid: 'source-resource-uuid' },
    });
    const user = userEvent.setup();

    // Step 0: Reduce limit to free 2 units
    await screen.findByText('Current limit');
    const cpuInput = await screen.findByTestId('row-cpu-input');
    fireEvent.change(cpuInput, { target: { value: '8' } });
    fireEvent.click(getNextButtonStep0());

    // Step 1: Add target resource
    const targetResource = {
      uuid: 'target-resource-uuid',
      name: 'Target Resource',
      offering_name: 'Offering A',
      limits: { cpu: 5 },
    };
    vi.mocked(marketplaceResourcesList).mockResolvedValue({
      data: [targetResource],
      response: {
        headers: new Headers({
          'x-result-count': '1',
        }),
      },
    } as any);

    await screen.findByText(/Find target resource/i);
    await typeAndSelectOption(
      user,
      'Find target resource(s)',
      'Target',
      /^Target Resource/,
    );

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

    renderDialog({
      resource: { marketplace_resource_uuid: 'source-resource-uuid' },
    });
    const user = userEvent.setup();

    // Step 0: Reduce limit
    const cpuInput = await screen.findByTestId('row-cpu-input');
    fireEvent.change(cpuInput, { target: { value: '8' } });
    fireEvent.click(getNextButtonStep0());

    // Step 1: Add target and allocate
    const targetResource = {
      uuid: 'target-resource-uuid',
      name: 'Target Resource',
      offering_name: 'Offering A',
      limits: { cpu: 5 },
    };
    vi.mocked(marketplaceResourcesList).mockResolvedValue({
      data: [targetResource],
      response: {
        headers: new Headers({
          'x-result-count': '1',
        }),
      },
    } as any);

    await typeAndSelectOption(
      user,
      'Find target resource(s)',
      'Target',
      /^Target Resource/,
    );

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
      expect(useNotify().showErrorResponse).toHaveBeenCalled();
    });
  });
});
