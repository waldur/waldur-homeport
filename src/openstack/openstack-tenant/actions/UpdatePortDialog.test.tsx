import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useManagedMutation } from '@/modal/useManagedMutation';
import { loadSubnets } from '@/openstack/api';

import { UpdatePortDialog } from './UpdatePortDialog';

vi.mock('@monaco-editor/react', () => {
  return {
    Editor: vi.fn(({ value, onChange, 'data-testid': testId }) => {
      return (
        <textarea
          data-testid={testId || 'monaco-editor'}
          value={value || ''}
          onChange={(e) => {
            if (onChange) onChange((e.target as HTMLTextAreaElement).value);
          }}
        />
      );
    }),
  };
});

vi.mock('@/form/monacoSetup', () => {
  return {
    initMonaco: vi.fn().mockResolvedValue({
      languages: {
        register: vi.fn(),
        setLanguageConfiguration: vi.fn(),
        setMonarchTokensProvider: vi.fn(),
      },
    }),
  };
});

vi.mock('@/modal/useManagedMutation', () => ({
  useManagedMutation: vi.fn(),
}));

vi.mock('@/openstack/api', () => ({
  loadSubnets: vi.fn(),
}));

vi.mock('waldur-js-client');

vi.mock('@/i18n', () => ({
  translate: (key) => key,
}));

const mockResource = {
  uuid: 'port-uuid',
  tenant_uuid: 'tenant-uuid',
  network_uuid: 'network-uuid',
  fixed_ips: [
    {
      ip_address: '10.0.0.10',
      subnet_id: 'subnet-backend-id',
    },
  ],
};

const mockSubnets = [
  {
    name: 'Subnet-One',
    uuid: 'sub-1-uuid',
    url: 'sub-1-url',
    backend_id: 'subnet-backend-id',
    cidr: '10.0.0.0/24',
    allocation_pools: [{ start: '10.0.0.2', end: '10.0.0.254' }],
  },
  {
    name: 'Subnet-Two',
    uuid: 'sub-2-uuid',
    url: 'sub-2-url',
    backend_id: 'sub-2-backend',
    cidr: '10.0.1.0/24',
    allocation_pools: [{ start: '10.0.1.2', end: '10.0.1.254' }],
  },
];

describe('UpdatePortDialog', () => {
  let queryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    vi.mocked(loadSubnets).mockResolvedValue(mockSubnets);

    vi.mocked(useManagedMutation).mockReturnValue({
      mutateAsync: vi.fn(),
    } as any);
  });

  const renderDialog = (resource = mockResource) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <UpdatePortDialog
          resolve={{ resource: resource as any, refetch: vi.fn() }}
        />
      </QueryClientProvider>,
    );
  };

  it('renders correctly and loads subnets', async () => {
    renderDialog();
    expect(await screen.findByText('Update port IP')).toBeDefined();
    expect(loadSubnets).toHaveBeenCalledWith({
      tenant_uuid: 'tenant-uuid',
      network_uuid: 'network-uuid',
    });
  });

  it('sets initial values correctly', async () => {
    renderDialog();
    // Subnet should be selected
    expect(await screen.findByText('Subnet-One')).toBeDefined();
    // Custom IP should be visible and set to the current IP
    expect(await screen.findByText('10.0.0.10')).toBeDefined();
  });

  it('toggles custom IP configuration', async () => {
    const user = userEvent.setup();
    renderDialog();

    const checkbox = await screen.findByLabelText('Custom IP configuration');
    // Initially checked because port has an IP
    expect(checkbox).toBeChecked();
    expect(screen.queryByLabelText('Custom IP')).not.toBeNull();

    // Uncheck it
    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
    // The field should be hidden
    expect(screen.queryByLabelText('Custom IP')).toBeNull();
  });

  it('submits form with updated data', async () => {
    const user = userEvent.setup();
    const mutateAsync = vi.fn().mockResolvedValue({});
    vi.mocked(useManagedMutation).mockReturnValue({ mutateAsync } as any);

    renderDialog();

    // Select 'Other' to enter manual IP
    const customIpSelect = await screen.findByLabelText('Custom IP');
    await user.click(customIpSelect);
    const otherOption = await screen.findByText('Other (manual input)');
    await user.click(otherOption);

    // Enter new IP
    const ipInput = await screen.findByPlaceholderText('Enter custom IP');
    await user.type(ipInput, '10.0.0.20');

    // Submit
    const submitButton = screen.getByText('Save');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          fixed_ips: {
            fixed_ip: '10.0.0.20',
            subnet: mockSubnets[0],
          },
        }),
        expect.anything(),
        expect.anything(),
      );
    });
  });
});
