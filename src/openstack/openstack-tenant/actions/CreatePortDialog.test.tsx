import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { useManagedMutation } from '@/modal/useManagedMutation';
import { loadNetworks, loadSubnets } from '@/openstack/api';

import { CreatePortDialog } from './CreatePortDialog';

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

// Mock other dependencies
vi.mock('@/modal/useManagedMutation', () => ({
  useManagedMutation: vi.fn(),
}));

vi.mock('@/openstack/api', () => ({
  loadNetworks: vi.fn(),
  loadSubnets: vi.fn(),
}));

vi.mock('waldur-js-client');

vi.mock('@/i18n', () => ({
  translate: (key) => key,
}));

const mockStore = configureStore();
const store = mockStore({
  modal: {},
  notifications: [],
});

const mockResource = {
  uuid: 'tenant-uuid',
  url: 'tenant-url',
};

const mockNetworks = [{ name: 'Network 1', uuid: 'net-1', url: 'net-1-url' }];

describe('CreatePortDialog', () => {
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

    vi.mocked(loadNetworks).mockResolvedValue(mockNetworks);
    vi.mocked(loadSubnets).mockResolvedValue([]);

    vi.mocked(useManagedMutation).mockReturnValue({
      mutateAsync: vi.fn(),
    } as any);
  });

  const renderDialog = () => {
    return render(
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <CreatePortDialog
            resolve={{ resource: mockResource, refetch: vi.fn() }}
          />
        </QueryClientProvider>
      </Provider>,
    );
  };

  const mockSubnets = [
    {
      name: 'Subnet 1',
      uuid: 'sub-1',
      url: 'sub-1-url',
      backend_id: 'sub-1-backend',
    },
  ];

  it('renders correctly', async () => {
    renderDialog();
    expect(
      await screen.findByText('Create port for OpenStack network'),
    ).toBeDefined();
    expect(await screen.findByLabelText('Name')).toBeDefined();
    expect(await screen.findByLabelText('Network')).toBeDefined();
  });

  it('loads networks on mount', async () => {
    renderDialog();
    await waitFor(() => {
      expect(loadNetworks).toHaveBeenCalledWith({
        tenant_uuid: 'tenant-uuid',
        field: ['name', 'uuid', 'url'],
      });
    });
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    renderDialog();

    const submitButton = await screen.findByText('Submit');
    await user.click(submitButton);

    const mutation = vi.mocked(useManagedMutation).mock.results[0].value;
    expect(mutation.mutateAsync).not.toHaveBeenCalled();
  });

  it('loads subnets when network is selected', async () => {
    const user = userEvent.setup();
    vi.mocked(loadSubnets).mockResolvedValue(mockSubnets);
    renderDialog();

    const networkSelect = await screen.findByLabelText('Network');
    // Open react-select and choose first option
    await user.click(networkSelect);
    const option = await screen.findByText('Network 1');
    await user.click(option);

    await waitFor(() => {
      expect(loadSubnets).toHaveBeenCalledWith({
        tenant_uuid: 'tenant-uuid',
        network_uuid: 'net-1',
      });
    });
  });

  it('toggles custom IP configuration and shows manual input', async () => {
    const user = userEvent.setup();
    vi.mocked(loadSubnets).mockResolvedValue(mockSubnets);
    renderDialog();

    // Select Network and Subnet first, otherwise fixed_ips is not initialized in form state
    const networkSelect = await screen.findByLabelText('Network');
    await user.click(networkSelect);
    await user.click(await screen.findByText('Network 1'));

    const subnetSelect = await screen.findByLabelText('Subnet');
    await user.click(subnetSelect);
    await user.click(await screen.findByText('Subnet 1'));

    const checkbox = await screen.findByLabelText('Custom IP configuration');
    expect(screen.queryByLabelText('Custom IP')).toBeNull();

    await user.click(checkbox);
    const customIpLabel = await screen.findByLabelText('Custom IP');
    expect(customIpLabel).toBeDefined();

    // Select 'Other' in Custom IP select
    await user.click(customIpLabel);
    const otherOption = await screen.findByText('Other (manual input)');
    await user.click(otherOption);

    // Should show the Enter custom IP placeholder
    expect(screen.getByPlaceholderText('Enter custom IP')).toBeDefined();
  });

  it('submits form with correct data', async () => {
    const user = userEvent.setup();
    const mutateAsync = vi.fn().mockResolvedValue({});
    vi.mocked(useManagedMutation).mockReturnValue({ mutateAsync } as any);
    vi.mocked(loadSubnets).mockResolvedValue(mockSubnets);

    renderDialog();

    // Fill Name
    await user.type(await screen.findByLabelText('Name'), 'test-port');

    // Select Network
    await user.click(await screen.findByLabelText('Network'));
    await user.click(await screen.findByText('Network 1'));

    // Select Subnet
    await user.click(await screen.findByLabelText('Subnet'));
    await user.click(await screen.findByText('Subnet 1'));

    // Fill MAC
    await user.type(
      await screen.findByLabelText('MAC address'),
      '00:11:22:33:44:55',
    );

    // Submit
    await user.click(await screen.findByText('Submit'));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'test-port',
          network: 'net-1-url',
          fixed_ips: expect.objectContaining({
            subnet: expect.objectContaining({ url: 'sub-1-url' }),
          }),
          mac_address: '00:11:22:33:44:55',
        }),
        expect.anything(),
        expect.anything(),
      );
    });
  });
});
