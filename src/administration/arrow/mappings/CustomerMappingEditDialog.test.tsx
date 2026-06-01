import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  adminArrowCustomerMappingsPartialUpdate,
  customersList,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';
import { typeAndSelectOption } from '@/test/select';
import { mockListResponse } from '@/test/utils';

import { CustomerMappingEditDialog } from './CustomerMappingEditDialog';

const mockMapping = {
  uuid: 'mapping-uuid',
  arrow_reference: 'ARROW-123',
  arrow_company_name: 'Arrow Company',
  waldur_customer_uuid: 'customer-uuid',
  waldur_customer_name: 'Waldur Customer',
  is_active: true,
} as any;

describe('CustomerMappingEditDialog', () => {
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders "Edit Customer Mapping" dialog correctly', () => {
    renderWithProviders(
      <CustomerMappingEditDialog
        resolve={{ mapping: mockMapping, refetch: mockRefetch }}
      />,
    );

    expect(screen.getByText('Edit Customer Mapping')).toBeInTheDocument();
    expect(screen.getByLabelText(/Arrow Reference/)).toHaveValue('ARROW-123');
    expect(screen.getByLabelText(/Arrow Company Name/)).toHaveValue(
      'Arrow Company',
    );
    expect(screen.getByText('Waldur Customer')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Active' })).toBeChecked();
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <CustomerMappingEditDialog
        resolve={{ mapping: mockMapping, refetch: mockRefetch }}
      />,
    );

    const saveButton = screen.getByText('Save');
    expect(saveButton).toBeEnabled();

    // Clear Arrow Reference
    const arrowRefInput = screen.getByLabelText(/Arrow Reference/);
    await user.clear(arrowRefInput);
    expect(saveButton).toBeDisabled();

    // Restore Arrow Reference
    await user.type(arrowRefInput, 'NEW-REF');
    await waitFor(() => expect(saveButton).toBeEnabled());
  });

  it('handles successful customer mapping update', async () => {
    const user = userEvent.setup();
    const updateSpy = vi
      .mocked(adminArrowCustomerMappingsPartialUpdate)
      .mockResolvedValue({} as any);

    renderWithProviders(
      <CustomerMappingEditDialog
        resolve={{ mapping: mockMapping, refetch: mockRefetch }}
      />,
    );

    await user.type(screen.getByLabelText(/Arrow Reference/), '-UPDATED');
    await user.click(screen.getByRole('checkbox', { name: 'Active' })); // Toggle off

    const saveButton = screen.getByText('Save');
    await user.click(saveButton);

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith({
        path: { uuid: 'mapping-uuid' },
        body: expect.objectContaining({
          arrow_reference: 'ARROW-123-UPDATED',
          is_active: false,
          waldur_customer: 'customer-uuid',
        }),
      });
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  it('allows changing Waldur Organization', async () => {
    const user = userEvent.setup();
    vi.mocked(customersList).mockResolvedValue(
      mockListResponse([
        { name: 'New Organization', uuid: 'new-customer-uuid' },
      ]),
    );

    renderWithProviders(
      <CustomerMappingEditDialog
        resolve={{ mapping: mockMapping, refetch: mockRefetch }}
      />,
    );

    // Search and select new organization
    await typeAndSelectOption(
      user,
      /Waldur Organization/i,
      'New',
      'New Organization',
    );

    const saveButton = screen.getByText('Save');
    await user.click(saveButton);

    await waitFor(() => {
      expect(adminArrowCustomerMappingsPartialUpdate).toHaveBeenCalledWith({
        path: { uuid: 'mapping-uuid' },
        body: expect.objectContaining({
          waldur_customer: 'new-customer-uuid',
        }),
      });
    });
  });

  it('displays mutation error when update fails', async () => {
    const user = userEvent.setup();
    const error = {
      response: {
        data: {
          detail: 'Custom API Error Message',
        },
      },
    };
    vi.mocked(adminArrowCustomerMappingsPartialUpdate).mockRejectedValue(error);

    renderWithProviders(
      <CustomerMappingEditDialog
        resolve={{ mapping: mockMapping, refetch: mockRefetch }}
      />,
    );

    const saveButton = screen.getByText('Save');
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Custom API Error Message')).toBeInTheDocument();
      expect(mockRefetch).not.toHaveBeenCalled();
    });
  });
});
