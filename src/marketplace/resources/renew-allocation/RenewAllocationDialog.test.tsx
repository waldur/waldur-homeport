import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  marketplaceResourcesRenew,
  marketplaceResourcesRetrieve,
} from 'waldur-js-client';

import { useModal } from '@/modal/actions';
import { useNotify } from '@/store/notify';

import { RenewAllocationDialog } from './RenewAllocationDialog';

vi.mock('waldur-js-client');
vi.mock('@/store/notify');
vi.mock('@/modal/actions');
vi.mock('@/i18n', () => ({
  translate: (key, context) => {
    if (context) {
      return Object.entries(context).reduce(
        (acc, [k, v]) => acc.replace(`{${k}}`, String(v)),
        key,
      );
    }
    return key;
  },
}));

// Mock Wizard because it's complex and we want to test RenewAllocationDialog's onSubmit
vi.mock('@/wizard', () => ({
  Wizard: ({ onSubmit, initialValues, title }) => (
    <div>
      <h1>{title}</h1>
      <button onClick={() => onSubmit(initialValues)}>Submit</button>
    </div>
  ),
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

describe('RenewAllocationDialog', () => {
  const mockRefetch = vi.fn();
  const mockShowSuccess = vi.fn();
  const mockShowErrorResponse = vi.fn();

  const resource = {
    uuid: 'res-1',
    marketplace_resource_uuid: 'm-res-1',
    name: 'Resource 1',
    offering_type: 'TestOffering',
    limits: {},
  } as any;

  const mockCloseDialog = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNotify).mockReturnValue({
      showSuccess: mockShowSuccess,
      showErrorResponse: mockShowErrorResponse,
    } as any);
    vi.mocked(useModal).mockReturnValue({
      closeDialog: mockCloseDialog,
    } as any);
    vi.mocked(marketplaceResourcesRetrieve).mockResolvedValue({
      data: resource,
    } as any);
  });

  const renderDialog = (props) =>
    render(<RenewAllocationDialog resolve={props} />, {
      wrapper: createWrapper(),
    });

  it('renders and submits single resource renewal', async () => {
    vi.mocked(marketplaceResourcesRenew).mockResolvedValue({} as any);

    renderDialog({ resource, refetch: mockRefetch });

    await waitFor(() =>
      expect(screen.getByText('Renew allocation for Resource 1')).toBeDefined(),
    );

    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(marketplaceResourcesRenew).toHaveBeenCalledWith(
        expect.objectContaining({
          path: { uuid: 'm-res-1' },
          body: expect.objectContaining({
            extension_months: 1,
          }),
        }),
      );
    });

    await waitFor(() => {
      expect(mockShowSuccess).toHaveBeenCalledWith(
        'Renewal request has been created.',
      );
    });
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('handles multi-resource renewal', async () => {
    vi.mocked(marketplaceResourcesRenew).mockResolvedValue({} as any);
    const resources = [
      { ...resource, uuid: 'res-1', marketplace_resource_uuid: 'm-res-1' },
      { ...resource, uuid: 'res-2', marketplace_resource_uuid: 'm-res-2' },
    ];

    renderDialog({ resources, refetch: mockRefetch });

    await waitFor(() =>
      expect(screen.getByText('Renew selected allocations (2)')).toBeDefined(),
    );

    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(marketplaceResourcesRenew).toHaveBeenCalledTimes(2);
    });

    await waitFor(() => {
      expect(mockShowSuccess).toHaveBeenCalledWith(
        'Renewal request has been created for 2 resources.',
      );
    });
  });
});
