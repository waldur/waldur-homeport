import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  adminArrowVendorOfferingMappingsCreate,
  adminArrowVendorOfferingMappingsPartialUpdate,
} from 'waldur-js-client';

import { useManagedMutation } from '@/modal/useManagedMutation';

import { VendorOfferingMappingDialog } from './VendorOfferingMappingDialog';

vi.mock('waldur-js-client');
vi.mock('@/modal/useManagedMutation');

// Mock SharedMappingFields as they contain complex components
vi.mock('./SharedMappingFields', () => ({
  VendorNameSelect: ({ input, label }) => (
    <div>
      <label>{label}</label>
      <input
        value={
          typeof input.value === 'string'
            ? input.value
            : input.value?.label || ''
        }
        onChange={(e) =>
          input.onChange({ value: e.target.value, label: e.target.value })
        }
        onBlur={input.onBlur}
        data-testid="vendor-name-input"
      />
    </div>
  ),
  PlanSelect: ({ input, label }) => (
    <div>
      <label>{label}</label>
      <input
        value={input.value?.uuid || ''}
        onChange={(e) =>
          input.onChange({ uuid: e.target.value, name: 'Test Plan' })
        }
        onBlur={input.onBlur}
        data-testid="plan-input"
      />
    </div>
  ),
}));

// Mock AsyncSelect (the offering field)
vi.mock('@/form/select', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    AsyncSelect: ({ input, label, onChange }) => (
      <div>
        <label>{label}</label>
        <input
          value={input.value?.uuid || ''}
          onChange={(e) => {
            const val = { uuid: e.target.value, name: 'Test Offering' };
            input.onChange(val);
            if (onChange) onChange(val);
          }}
          onBlur={input.onBlur}
          data-testid="offering-input"
        />
      </div>
    ),
  };
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
    vi.mocked(useManagedMutation).mockImplementation(
      (options: any) =>
        ({
          mutateAsync: vi.fn((values) => options.mutationFn(values)),
          isPending: false,
        }) as any,
    );
  });

  it('renders create mode', () => {
    render(
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
    render(
      <VendorOfferingMappingDialog
        resolve={{ mapping: mockMapping, refetch: mockRefetch }}
      />,
    );
    expect(
      screen.getByText('Edit vendor offering mapping'),
    ).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing Vendor')).toBeInTheDocument();
  });

  it('handles create submission', async () => {
    const user = userEvent.setup();
    const createSpy = vi
      .mocked(adminArrowVendorOfferingMappingsCreate)
      .mockResolvedValue({ data: {} } as any);

    render(
      <VendorOfferingMappingDialog
        resolve={{ settings: mockSettings, refetch: mockRefetch }}
      />,
    );

    await user.type(screen.getByTestId('vendor-name-input'), 'New Vendor');
    await user.type(screen.getByTestId('offering-input'), 'new-offering-uuid');
    await user.type(screen.getByTestId('plan-input'), 'new-plan-uuid');

    await user.click(screen.getByText('Create'));

    await waitFor(() => {
      expect(createSpy).toHaveBeenCalledWith({
        body: expect.objectContaining({
          settings: 'settings-uuid',
          arrow_vendor_name: 'New Vendor',
          offering: 'new-offering-uuid',
          plan: 'new-plan-uuid',
        }),
      });
    });
  });

  it('handles edit submission', async () => {
    const user = userEvent.setup();
    const updateSpy = vi
      .mocked(adminArrowVendorOfferingMappingsPartialUpdate)
      .mockResolvedValue({ data: {} } as any);

    render(
      <VendorOfferingMappingDialog
        resolve={{ mapping: mockMapping, refetch: mockRefetch }}
      />,
    );

    const vendorInput = screen.getByTestId('vendor-name-input');
    await user.clear(vendorInput);
    await user.type(vendorInput, 'Updated Vendor');

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
    render(
      <VendorOfferingMappingDialog
        resolve={{ mapping: mockMapping, refetch: mockRefetch }}
      />,
    );

    const offeringInput = screen.getByTestId('offering-input');
    const planInput = screen.getByTestId('plan-input');

    expect(planInput).toHaveValue('plan-uuid');

    await user.type(offeringInput, 'other-offering');

    await waitFor(() => {
      expect(planInput).toHaveValue('');
    });
  });

  it('prevents submission if required fields are missing', async () => {
    const user = userEvent.setup();
    render(
      <VendorOfferingMappingDialog
        resolve={{ settings: mockSettings, refetch: mockRefetch }}
      />,
    );

    const submitButton = screen.getByText('Create');

    // Button should be disabled due to react-final-form validation
    expect(submitButton).toBeDisabled();

    // Fill only vendor name
    await user.type(screen.getByTestId('vendor-name-input'), 'New Vendor');
    expect(submitButton).toBeDisabled();

    // Fill offering
    await user.type(screen.getByTestId('offering-input'), 'new-offering-uuid');

    // Now it should be enabled
    expect(submitButton).not.toBeDisabled();
  });
});
