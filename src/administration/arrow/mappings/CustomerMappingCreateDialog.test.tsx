import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  adminArrowCustomerMappingsAvailableCustomersRetrieve,
  adminArrowCustomerMappingsCreate,
  adminArrowSettingsList,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';
import { typeAndSelectOption } from '@/test/select';

import { CustomerMappingCreateDialog } from './CustomerMappingCreateDialog';

const mockArrowSettings = {
  uuid: 'settings-uuid',
};

const mockAvailableData = {
  arrow_customers: [
    { reference: 'ARROW-1', companyName: 'Arrow Corp 1' },
    { reference: 'ARROW-2', companyName: 'Arrow Corp 2' },
  ],
  waldur_customers: [
    { uuid: 'waldur-1', name: 'Waldur Org 1' },
    { uuid: 'waldur-2', name: 'Waldur Org 2' },
  ],
  suggestions: [
    {
      arrow_customer: { reference: 'ARROW-1' },
      suggested_waldur_customer: { uuid: 'waldur-1', name: 'Waldur Org 1' },
      confidence: 0.9,
    },
  ],
};

describe('CustomerMappingCreateDialog', () => {
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mocks to avoid "settings not configured" or loading states by default
    vi.mocked(adminArrowSettingsList).mockResolvedValue({
      data: [mockArrowSettings],
    } as any);
    vi.mocked(
      adminArrowCustomerMappingsAvailableCustomersRetrieve,
    ).mockResolvedValue({ data: mockAvailableData } as any);
  });

  const waitForLoadingToFinish = async () => {
    await waitFor(() => {
      expect(
        screen.queryByText(/Loading Arrow customers/i),
      ).not.toBeInTheDocument();
    });
  };

  it('renders "Create Customer Mapping" dialog correctly', async () => {
    renderWithProviders(
      <CustomerMappingCreateDialog resolve={{ refetch: mockRefetch }} />,
    );

    await waitForLoadingToFinish();

    expect(screen.getByText('Create Customer Mapping')).toBeInTheDocument();
    expect(screen.getByLabelText(/Arrow Customer/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Waldur Organization/i)).toBeInTheDocument();
  });

  it('auto-fills Waldur Organization when Arrow customer is selected with high confidence', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <CustomerMappingCreateDialog resolve={{ refetch: mockRefetch }} />,
    );

    await waitForLoadingToFinish();

    await typeAndSelectOption(
      user,
      /Arrow Customer/i,
      'Corp 1',
      'Arrow Corp 1 (ARROW-1) (90% match)',
    );

    await waitFor(() => {
      // Check if Waldur Organization is selected
      expect(screen.getByText('Waldur Org 1')).toBeInTheDocument();
      expect(
        screen.getByText(/Auto-matched with 90% confidence/i),
      ).toBeInTheDocument();
    });
  });

  it('handles successful mapping creation', async () => {
    const user = userEvent.setup();
    const createSpy = vi
      .mocked(adminArrowCustomerMappingsCreate)
      .mockResolvedValue({} as any);

    renderWithProviders(
      <CustomerMappingCreateDialog resolve={{ refetch: mockRefetch }} />,
    );

    await waitForLoadingToFinish();

    await typeAndSelectOption(
      user,
      /Arrow Customer/i,
      'Corp 1',
      'Arrow Corp 1 (ARROW-1) (90% match)',
    );

    const createButton = screen.getByText('Create');
    await user.click(createButton);

    await waitFor(() => {
      expect(createSpy).toHaveBeenCalledWith({
        body: {
          settings: 'settings-uuid',
          arrow_reference: 'ARROW-1',
          arrow_company_name: 'Arrow Corp 1',
          waldur_customer: 'waldur-1',
        },
      });
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  it('shows warning when Arrow settings are not configured', async () => {
    vi.mocked(adminArrowSettingsList).mockResolvedValue({ data: [] } as any);
    renderWithProviders(
      <CustomerMappingCreateDialog resolve={{ refetch: mockRefetch }} />,
    );

    await waitFor(() => {
      expect(
        screen.getByText(/Arrow settings not configured/i),
      ).toBeInTheDocument();
    });
  });

  it('shows loading state', async () => {
    // Reset to a pending promise
    vi.mocked(
      adminArrowCustomerMappingsAvailableCustomersRetrieve,
    ).mockReturnValue(new Promise(() => {}));

    renderWithProviders(
      <CustomerMappingCreateDialog resolve={{ refetch: mockRefetch }} />,
    );

    await waitFor(() => {
      expect(screen.getByText(/Loading Arrow customers/i)).toBeInTheDocument();
    });
  });
});
