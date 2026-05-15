import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  openstackNetworksCreateSubnet,
  openstackNetworksList,
} from 'waldur-js-client';

import { CreateSubnetDialog } from './CreateSubnetDialog';

vi.mock('waldur-js-client', async (importOriginal) => {
  const mod = await importOriginal<any>();
  return {
    ...mod,
    openstackNetworksCreateSubnet: vi.fn(),
    openstackNetworksList: vi.fn(),
  };
});

vi.mock('@/form/MonacoField', () => ({
  MonacoField: () => <div data-testid="monaco-field" />,
}));

const fakeResource = {
  name: 'Network',
  uuid: 'network-uuid',
};

const renderDialog = (resource = fakeResource, showNetworkField = false) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const store = createStore((state) => state, {
    notifications: [],
  });
  return render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <CreateSubnetDialog
          resolve={{
            resource: resource as any,
            refetch: vi.fn(),
            showNetworkField,
          }}
        />
      </QueryClientProvider>
    </Provider>,
  );
};

describe('CreateSubnetDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correct title and fields', () => {
    renderDialog();
    expect(screen.getByText('Create subnet')).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Internal network mask \(CIDR\)/),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Name/)).toBeInTheDocument();
  });

  it('submits form with correct data when showNetworkField is false', async () => {
    const user = userEvent.setup();
    vi.mocked(openstackNetworksCreateSubnet).mockResolvedValue({} as any);
    renderDialog();

    await user.type(screen.getByLabelText(/Name/), 'test-subnet');

    const cidrInput = screen.getByLabelText(/Internal network mask \(CIDR\)/);
    await user.clear(cidrInput);
    await user.type(cidrInput, '10.0.0.0/24');

    await user.click(screen.getByRole('button', { name: /Submit/i }));

    await waitFor(() => {
      expect(openstackNetworksCreateSubnet).toHaveBeenCalledWith({
        path: { uuid: 'network-uuid' },
        body: expect.objectContaining({
          name: 'test-subnet',
          cidr: '10.0.0.0/24',
          allocation_pools: expect.arrayContaining([
            expect.objectContaining({
              start: '10.0.0.2',
              end: '10.0.0.254',
            }),
          ]),
        }),
      });
    });
  });

  it('renders and selects network when showNetworkField is true', async () => {
    const user = userEvent.setup();
    vi.mocked(openstackNetworksList).mockResolvedValue({
      data: [{ name: 'Selected Network', uuid: 'selected-network-uuid' }],
      headers: { 'x-result-count': '1' },
    } as any);
    vi.mocked(openstackNetworksCreateSubnet).mockResolvedValue({} as any);

    renderDialog(fakeResource, true);

    expect(screen.getByText('Network')).toBeInTheDocument();

    await user.type(screen.getByLabelText(/Name/), 'test-subnet-with-network');
    await user.click(screen.getByRole('button', { name: /Submit/i }));
  });

  it('submits optional fields correctly', async () => {
    const user = userEvent.setup();
    vi.mocked(openstackNetworksCreateSubnet).mockResolvedValue({} as any);
    renderDialog();

    await user.type(screen.getByLabelText(/Name/), 'full-subnet');
    await user.type(screen.getByLabelText('Description'), 'Full description');
    await user.type(
      screen.getByLabelText('Gateway IP of this subnet'),
      '192.168.42.1',
    );

    const disableGatewaySwitch = screen.getByLabelText(
      'Disable gateway IP advertising via DHCP',
    );
    await user.click(disableGatewaySwitch);

    await user.click(screen.getByRole('button', { name: /Submit/i }));

    await waitFor(() => {
      expect(openstackNetworksCreateSubnet).toHaveBeenCalledWith({
        path: { uuid: 'network-uuid' },
        body: expect.objectContaining({
          name: 'full-subnet',
          description: 'Full description',
          gateway_ip: '192.168.42.1',
          disable_gateway: true,
        }),
      });
    });
  });
});
