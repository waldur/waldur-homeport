import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  callManagingOrganisationsCreate,
  callManagingOrganisationsDestroy,
  callManagingOrganisationsList,
  Customer,
  customersRetrieve,
} from 'waldur-js-client';

import { useModal } from '@/modal/actions';
import { renderWithProviders } from '@/test/harness';
import { useCustomer, useSetCustomer } from '@/workspace/hooks';

import { CustomerCallManagerPanel } from './CustomerCallManagerPanel';

describe('CustomerCallManagerPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(callManagingOrganisationsList).mockResolvedValue({
      data: [{ uuid: 'info-uuid-1' }],
    } as any);

    vi.mocked(customersRetrieve).mockResolvedValue({
      data: {
        uuid: 'customer-uuid-1',
        name: 'Test Customer',
      },
    } as any);
  });

  it('renders and fetches call managing organisation info', async () => {
    vi.mocked(useCustomer).mockReturnValue({
      uuid: 'customer-uuid-1',
      url: '/api/customers/customer-uuid-1/',
      call_managing_organization_uuid: 'some-uuid',
    } as any);

    renderWithProviders(<CustomerCallManagerPanel />);

    expect(screen.getByText('Call manager')).toBeInTheDocument();

    await waitFor(() => {
      expect(callManagingOrganisationsList).toHaveBeenCalledWith({
        query: { customer_uuid: 'customer-uuid-1' },
      });
    });

    const checkbox = screen.getByLabelText('Enable call manager');
    expect(checkbox).toBeChecked();
  });

  it('handles enabling call manager successfully', async () => {
    const user = userEvent.setup();
    vi.mocked(useCustomer).mockReturnValue({
      uuid: 'customer-uuid-1',
      url: '/api/customers/customer-uuid-1/',
      call_managing_organization_uuid: null,
    } satisfies Customer);

    vi.mocked(useModal().confirm).mockResolvedValue(undefined);
    vi.mocked(callManagingOrganisationsCreate).mockResolvedValue({
      data: { uuid: 'new-info-uuid' },
    } as any);

    renderWithProviders(<CustomerCallManagerPanel />);

    const checkbox = screen.getByLabelText('Enable call manager');
    expect(checkbox).not.toBeChecked();

    await user.click(checkbox);

    await waitFor(() =>
      expect(vi.mocked(useModal().confirm)).toHaveBeenCalled(),
    );

    await waitFor(() => {
      expect(callManagingOrganisationsCreate).toHaveBeenCalledWith({
        body: {
          customer: '/api/customers/customer-uuid-1/',
          description: '',
          image: null,
        },
      });
    });

    await waitFor(() => {
      expect(customersRetrieve).toHaveBeenCalledWith({
        path: { uuid: 'customer-uuid-1' },
      });
    });

    expect(useSetCustomer()).toHaveBeenCalledWith({
      uuid: 'customer-uuid-1',
      name: 'Test Customer',
    });
  });

  it('handles disabling call manager successfully', async () => {
    const user = userEvent.setup();
    vi.mocked(useCustomer).mockReturnValue({
      uuid: 'customer-uuid-1',
      url: '/api/customers/customer-uuid-1/',
      call_managing_organization_uuid: 'existing-uuid',
    } as any);

    vi.mocked(useModal().confirm).mockResolvedValue(undefined);
    vi.mocked(callManagingOrganisationsDestroy).mockResolvedValue({} as any);

    renderWithProviders(<CustomerCallManagerPanel />);

    // Wait for the query to resolve so infoUuid is set in the component
    await waitFor(() => {
      expect(callManagingOrganisationsList).toHaveBeenCalled();
    });

    const checkbox = screen.getByLabelText('Enable call manager');
    expect(checkbox).toBeChecked();

    await user.click(checkbox);

    await waitFor(() =>
      expect(vi.mocked(useModal().confirm)).toHaveBeenCalled(),
    );

    await waitFor(() => {
      expect(callManagingOrganisationsDestroy).toHaveBeenCalledWith({
        path: { uuid: 'info-uuid-1' },
      });
    });

    await waitFor(() => {
      expect(customersRetrieve).toHaveBeenCalledWith({
        path: { uuid: 'customer-uuid-1' },
      });
    });

    expect(useSetCustomer()).toHaveBeenCalledWith({
      uuid: 'customer-uuid-1',
      name: 'Test Customer',
    });
  });
});
