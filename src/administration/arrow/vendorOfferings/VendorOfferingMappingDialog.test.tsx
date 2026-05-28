import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  adminArrowVendorOfferingMappingsCreate,
  adminArrowVendorOfferingMappingsPartialUpdate,
  adminArrowVendorOfferingMappingsVendorChoicesList,
  marketplacePublicOfferingsList,
  marketplacePublicOfferingsPlansList,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';
import {
  clearSelect,
  openAndSelectOption,
  typeAndCreateOption,
} from '@/test/select';

import { VendorOfferingMappingDialog } from './VendorOfferingMappingDialog';

const mockOfferings = [
  { uuid: 'offering-1', name: 'Test Offering 1' },
  { uuid: 'offering-2', name: 'Test Offering 2' },
];

const mockPlans = [
  { uuid: 'plan-1', name: 'Test Plan 1' },
  { uuid: 'plan-2', name: 'Test Plan 2' },
];

const mockVendorChoices = [
  { value: 'Vendor A', label: 'Vendor A' },
  { value: 'Vendor B', label: 'Vendor B' },
];

const mockApiResponse = (data: any[]) => ({
  data,
  response: {
    headers: new Headers({ 'x-result-count': String(data.length) }),
  },
});

describe('VendorOfferingMappingDialog', () => {
  const mockRefetch = vi.fn();
  const mockSettings = { uuid: 'settings-uuid' };
  const mockMapping = {
    uuid: 'mapping-uuid',
    arrow_vendor_name: 'Existing Vendor',
    offering_uuid: 'offering-uuid',
    offering_name: 'Existing Offering',
    plan_uuid: 'plan-uuid',
    plan_name: 'Existing Plan',
    settings_uuid: 'settings-uuid',
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(
      adminArrowVendorOfferingMappingsVendorChoicesList,
    ).mockResolvedValue({ data: mockVendorChoices } as any);
    vi.mocked(marketplacePublicOfferingsList).mockResolvedValue(
      mockApiResponse(mockOfferings) as any,
    );
    vi.mocked(marketplacePublicOfferingsPlansList).mockResolvedValue({
      data: mockPlans,
    } as any);
  });

  it('renders create mode', () => {
    renderWithProviders(
      <VendorOfferingMappingDialog
        resolve={{ settings: mockSettings, refetch: mockRefetch }}
      />,
    );
    expect(
      screen.getByText('Create vendor offering mapping'),
    ).toBeInTheDocument();
    expect(screen.getByText('Create')).toBeInTheDocument();
  });

  it('renders edit mode', () => {
    renderWithProviders(
      <VendorOfferingMappingDialog
        resolve={{ mapping: mockMapping, refetch: mockRefetch }}
      />,
    );
    expect(
      screen.getByText('Edit vendor offering mapping'),
    ).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Existing Vendor')).toBeInTheDocument();
  });

  it('handles create submission', async () => {
    const user = userEvent.setup();
    const createSpy = vi
      .mocked(adminArrowVendorOfferingMappingsCreate)
      .mockResolvedValue({ data: {} } as any);

    renderWithProviders(
      <VendorOfferingMappingDialog
        resolve={{ settings: mockSettings, refetch: mockRefetch }}
      />,
    );

    // Fill vendor name via creatable select
    await typeAndCreateOption(user, 'Arrow vendor name', 'New Vendor');

    // Select offering
    await openAndSelectOption(user, 'Waldur offering', 'Test Offering 1');

    // Wait for plans to load after offering selection
    await waitFor(() => {
      expect(marketplacePublicOfferingsPlansList).toHaveBeenCalled();
    });

    // Select plan
    await openAndSelectOption(user, 'Plan', 'Test Plan 1');

    await user.click(screen.getByText('Create'));

    await waitFor(() => {
      expect(createSpy).toHaveBeenCalledWith({
        body: expect.objectContaining({
          settings: 'settings-uuid',
          arrow_vendor_name: 'New Vendor',
          offering: 'offering-1',
          plan: 'plan-1',
        }),
      });
    });
  });

  it('handles edit submission', async () => {
    const user = userEvent.setup();
    const updateSpy = vi
      .mocked(adminArrowVendorOfferingMappingsPartialUpdate)
      .mockResolvedValue({ data: {} } as any);

    renderWithProviders(
      <VendorOfferingMappingDialog
        resolve={{ mapping: mockMapping, refetch: mockRefetch }}
      />,
    );

    // Clear existing vendor name and type new one
    await clearSelect(user, 'Arrow vendor name');
    await typeAndCreateOption(user, 'Arrow vendor name', 'Updated Vendor');

    await user.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith({
        path: { uuid: 'mapping-uuid' },
        body: expect.objectContaining({
          arrow_vendor_name: 'Updated Vendor',
          offering: 'offering-uuid',
          plan: 'plan-uuid',
        }),
      });
    });
  });

  it('clears plan when offering changes', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <VendorOfferingMappingDialog
        resolve={{ mapping: mockMapping, refetch: mockRefetch }}
      />,
    );

    // Verify initial plan value is shown
    expect(screen.getByText('Existing Plan')).toBeInTheDocument();

    // Change offering - select a different one
    await openAndSelectOption(user, 'Waldur offering', 'Test Offering 1');

    // Plan should be cleared
    await waitFor(() => {
      expect(screen.queryByText('Existing Plan')).not.toBeInTheDocument();
    });
  });

  it('prevents submission if required fields are missing', () => {
    renderWithProviders(
      <VendorOfferingMappingDialog
        resolve={{ settings: mockSettings, refetch: mockRefetch }}
      />,
    );

    const submitButton = screen.getByText('Create');

    // Button should be disabled due to react-final-form validation
    expect(submitButton).toBeDisabled();
  });
});
