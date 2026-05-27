import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  callManagingOrganisationsCreate,
  callManagingOrganisationsDestroy,
  callManagingOrganisationsList,
} from 'waldur-js-client';

import { useModal } from '@/modal/actions';
import { setCurrentCustomer } from '@/workspace/actions';
import { useCustomer } from '@/workspace/hooks';

import { getCustomer as getCustomerApi } from '../utils';

import { CustomerCallManagerPanel } from './CustomerCallManagerPanel';

vi.mock('waldur-js-client');
vi.mock('../utils');
vi.mock('@/workspace/actions');

const mockSetCustomer = vi.fn();
vi.mock('@/workspace/hooks', () => ({
  useCustomer: vi.fn(),
  useSetCustomer: () => mockSetCustomer,
}));

const mockShowSuccess = vi.fn();
const mockShowErrorResponse = vi.fn();
vi.mock('@/store/notify', () => ({
  useNotify: () => ({
    showSuccess: mockShowSuccess,
    showErrorResponse: mockShowErrorResponse,
  }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('CustomerCallManagerPanel', () => {
  const mockConfirm = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useModal).mockReturnValue({
      confirm: mockConfirm,
      closeDialog: vi.fn(),
    } as any);

    vi.mocked(callManagingOrganisationsList).mockResolvedValue({
      data: [{ uuid: 'info-uuid-1' }],
    } as any);

    vi.mocked(getCustomerApi).mockResolvedValue({
      uuid: 'customer-uuid-1',
      name: 'Test Customer',
    } as any);

    vi.mocked(setCurrentCustomer).mockReturnValue({
      type: 'SET_CURRENT_CUSTOMER',
    } as any);
  });

  it('renders and fetches call managing organisation info', async () => {
    vi.mocked(useCustomer).mockReturnValue({
      uuid: 'customer-uuid-1',
      url: '/api/customers/customer-uuid-1/',
      call_managing_organization_uuid: 'some-uuid',
    } as any);

    render(<CustomerCallManagerPanel />, { wrapper: createWrapper() });

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
    vi.mocked(useCustomer).mockReturnValue({
      uuid: 'customer-uuid-1',
      url: '/api/customers/customer-uuid-1/',
      call_managing_organization_uuid: null,
    } as any);

    mockConfirm.mockResolvedValue(undefined);
    vi.mocked(callManagingOrganisationsCreate).mockResolvedValue({
      data: { uuid: 'new-info-uuid' },
    } as any);

    render(<CustomerCallManagerPanel />, { wrapper: createWrapper() });

    const checkbox = screen.getByLabelText('Enable call manager');
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);

    await waitFor(() => expect(mockConfirm).toHaveBeenCalled());

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
      expect(getCustomerApi).toHaveBeenCalledWith('customer-uuid-1');
    });

    expect(mockSetCustomer).toHaveBeenCalledWith({
      uuid: 'customer-uuid-1',
      name: 'Test Customer',
    });
  });

  it('handles disabling call manager successfully', async () => {
    vi.mocked(useCustomer).mockReturnValue({
      uuid: 'customer-uuid-1',
      url: '/api/customers/customer-uuid-1/',
      call_managing_organization_uuid: 'existing-uuid',
    } as any);

    mockConfirm.mockResolvedValue(undefined);
    vi.mocked(callManagingOrganisationsDestroy).mockResolvedValue({} as any);

    render(<CustomerCallManagerPanel />, { wrapper: createWrapper() });

    // Wait for the query to resolve so infoUuid is set in the component
    await waitFor(() => {
      expect(callManagingOrganisationsList).toHaveBeenCalled();
    });

    const checkbox = screen.getByLabelText('Enable call manager');
    expect(checkbox).toBeChecked();

    fireEvent.click(checkbox);

    await waitFor(() => expect(mockConfirm).toHaveBeenCalled());

    await waitFor(() => {
      expect(callManagingOrganisationsDestroy).toHaveBeenCalledWith({
        path: { uuid: 'info-uuid-1' },
      });
    });

    await waitFor(() => {
      expect(getCustomerApi).toHaveBeenCalledWith('customer-uuid-1');
    });

    expect(mockSetCustomer).toHaveBeenCalledWith({
      uuid: 'customer-uuid-1',
      name: 'Test Customer',
    });
  });
});
