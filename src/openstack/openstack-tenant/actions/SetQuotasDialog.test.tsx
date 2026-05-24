import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { openstackTenantsSetQuotas } from 'waldur-js-client';

import { SetQuotasDialog } from './SetQuotasDialog';

vi.mock('waldur-js-client');
vi.mock('@/i18n', () => ({
  translate: (key) => key,
  formatJsx: (key) => key,
  formatJsxTemplate: (key) => key,
}));
vi.mock('@/modal/actions', () => ({
  useModal: () => ({
    closeDialog: vi.fn(),
    confirm: vi.fn(),
  }),
}));
vi.mock('@/store/notify', () => ({
  useNotify: () => ({
    showSuccess: vi.fn(),
    showErrorResponse: vi.fn(),
  }),
}));

const makeResource = (overrides: any = {}) => ({
  uuid: 'tenant-uuid',
  name: 'Test Tenant',
  state: 'OK',
  provider_uuid: 'provider-uuid',
  quotas: [
    { name: 'instances', usage: 0, limit: 10 },
    { name: 'vcpu', usage: 2, limit: 8 },
    { name: 'ram', usage: 1024, limit: 4096 }, // MiB → 4 GB
    { name: 'volumes', usage: 1, limit: 5 },
    { name: 'snapshots', usage: 0, limit: 3 },
    { name: 'storage', usage: 2048, limit: 10240 }, // MiB → 10 GB
    { name: 'security_group_count', usage: 1, limit: 10 },
    { name: 'security_group_rule_count', usage: 5, limit: 100 },
    // Neutron quotas (settable, accept -1 for unlimited)
    { name: 'floating_ip_count', usage: 2, limit: 50 },
    { name: 'network_count', usage: 1, limit: 10 },
    { name: 'subnet_count', usage: 1, limit: 10 },
    { name: 'port_count', usage: 4, limit: 20 },
    // Read-only derived quotas
    { name: 'volumes_size', usage: 100, limit: 500 },
    { name: 'snapshots_size', usage: 50, limit: 500 },
  ],
  ...overrides,
});

const renderDialog = (resource = makeResource()) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const store = createStore((state) => state, { notifications: [] });
  return render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <SetQuotasDialog resolve={{ resource, refetch: vi.fn() }} />
      </QueryClientProvider>
    </Provider>,
  );
};

// Find the number input in the table row that contains the given label text.
const getInputByQuotaName = (name: string): HTMLInputElement => {
  const rows = screen.getAllByRole('row');
  for (const row of rows) {
    if (row.textContent?.includes(name)) {
      const input = row.querySelector('input[type="number"]');
      if (input) return input as HTMLInputElement;
    }
  }
  throw new Error(`No number input found in row containing "${name}"`);
};

describe('SetQuotasDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dialog title and table column headers', () => {
    renderDialog();
    expect(screen.getByText('Change quotas')).toBeInTheDocument();
    expect(screen.getByText('Component')).toBeInTheDocument();
    expect(screen.getByText('Usage')).toBeInTheDocument();
    expect(screen.getByText('Current limit')).toBeInTheDocument();
    expect(screen.getByText('New limit')).toBeInTheDocument();
    expect(screen.getByText('Difference')).toBeInTheDocument();
  });

  it('renders category section headers', () => {
    renderDialog();
    expect(screen.getByText('Compute')).toBeInTheDocument();
    expect(screen.getByText('Network')).toBeInTheDocument();
    // Storage appears as both category header and quota label — multiple matches expected
    expect(screen.getAllByText('Storage').length).toBeGreaterThanOrEqual(2);
  });

  it('renders editable inputs for all 12 settable quotas and not for derived ones', () => {
    renderDialog();
    const rows = screen.getAllByRole('row');

    // All 12 settable quotas have number inputs
    const settableNames = [
      'instances',
      'vcpu',
      'ram',
      'volumes',
      'snapshots',
      'storage',
      'security_group_count',
      'security_group_rule_count',
      'floating_ip_count',
      'network_count',
      'subnet_count',
      'port_count',
    ];
    for (const name of settableNames) {
      expect(
        screen.getByTestId(`quota-${name}`),
        `expected input for quota-${name}`,
      ).toBeInTheDocument();
    }

    // volumes_size is derived/read-only — its row should have no number input
    const volumesSizeRow = rows.find((r) =>
      r.textContent?.includes('Volumes size'),
    );
    expect(volumesSizeRow).toBeDefined();
    expect(volumesSizeRow?.querySelector('input[type="number"]')).toBeNull();
  });

  describe('MiB to GB conversion on initialValues', () => {
    it('converts RAM from MiB to GB (4096 MiB → 4 GB)', () => {
      renderDialog();
      const ramInput = getInputByQuotaName('RAM');
      expect(ramInput).toHaveValue(4);
    });

    it('converts storage from MiB to GB (10240 MiB → 10 GB)', () => {
      renderDialog();
      const storageInput = getInputByQuotaName('Storage');
      expect(storageInput).toHaveValue(10);
    });
  });

  describe('GB to MiB conversion on submit', () => {
    it('sends RAM in MiB (GB × 1024) when submitting', async () => {
      const user = userEvent.setup();
      vi.mocked(openstackTenantsSetQuotas).mockResolvedValue({} as any);

      renderDialog();

      const ramInput = getInputByQuotaName('RAM');
      await user.clear(ramInput);
      await user.type(ramInput, '8');

      await user.click(screen.getByRole('button', { name: /Save/i }));

      await waitFor(() => {
        expect(openstackTenantsSetQuotas).toHaveBeenCalledWith(
          expect.objectContaining({
            body: expect.objectContaining({
              ram: 8 * 1024, // 8192 MiB
            }),
          }),
        );
      });
    });

    it('sends storage in MiB (GB × 1024) when submitting', async () => {
      const user = userEvent.setup();
      vi.mocked(openstackTenantsSetQuotas).mockResolvedValue({} as any);

      renderDialog();

      const storageInput = getInputByQuotaName('Storage');
      await user.clear(storageInput);
      await user.type(storageInput, '20');

      await user.click(screen.getByRole('button', { name: /Save/i }));

      await waitFor(() => {
        expect(openstackTenantsSetQuotas).toHaveBeenCalledWith(
          expect.objectContaining({
            body: expect.objectContaining({
              storage: 20 * 1024, // 20480 MiB
            }),
          }),
        );
      });
    });
  });

  it('includes all settable fields in the submit body', async () => {
    const user = userEvent.setup();
    vi.mocked(openstackTenantsSetQuotas).mockResolvedValue({} as any);

    renderDialog();

    await user.click(screen.getByRole('button', { name: /Save/i }));

    await waitFor(() => {
      expect(openstackTenantsSetQuotas).toHaveBeenCalledWith(
        expect.objectContaining({
          path: { uuid: 'tenant-uuid' },
          body: expect.objectContaining({
            instances: 10,
            vcpu: 8,
            ram: 4096, // 4 GB × 1024
            volumes: 5,
            snapshots: 3,
            storage: 10240, // 10 GB × 1024
            security_group_count: 10,
            security_group_rule_count: 100,
            floating_ip_count: 50,
            network_count: 10,
            subnet_count: 10,
            port_count: 20,
          }),
        }),
      );
    });
  });

  it('renders all 12 settable inputs when quotas is empty', () => {
    renderDialog(makeResource({ quotas: [] }));
    const settableNames = [
      'vcpu',
      'ram',
      'instances',
      'volumes',
      'snapshots',
      'storage',
      'security_group_count',
      'security_group_rule_count',
      'floating_ip_count',
      'network_count',
      'subnet_count',
      'port_count',
    ];
    for (const name of settableNames) {
      expect(
        screen.getByTestId(`quota-${name}`),
        `expected input for quota-${name}`,
      ).toBeInTheDocument();
    }
  });

  it('sends only filled fields when quotas is empty and one field is set', async () => {
    const user = userEvent.setup();
    vi.mocked(openstackTenantsSetQuotas).mockResolvedValue({} as any);

    renderDialog(makeResource({ quotas: [] }));

    const vcpuInput = screen.getByTestId('quota-vcpu');
    await user.clear(vcpuInput);
    await user.type(vcpuInput, '16');

    await user.click(screen.getByRole('button', { name: /Save/i }));

    await waitFor(() => {
      const callArgs = vi.mocked(openstackTenantsSetQuotas).mock.calls[0][0];
      expect(callArgs.body).toEqual({ vcpu: 16 });
    });
  });

  it('omits settable fields with no quota data from submit body', async () => {
    const user = userEvent.setup();
    vi.mocked(openstackTenantsSetQuotas).mockResolvedValue({} as any);

    // Resource with only instances and vcpu quotas set
    const partialResource = makeResource({
      quotas: [
        { name: 'instances', usage: 0, limit: 5 },
        { name: 'vcpu', usage: 1, limit: 4 },
      ],
    });
    renderDialog(partialResource);

    await user.click(screen.getByRole('button', { name: /Save/i }));

    await waitFor(() => {
      const callArgs = vi.mocked(openstackTenantsSetQuotas).mock.calls[0][0];
      expect(callArgs.body).toHaveProperty('instances', 5);
      expect(callArgs.body).toHaveProperty('vcpu', 4);
      expect(callArgs.body).not.toHaveProperty('ram');
      expect(callArgs.body).not.toHaveProperty('storage');
    });
  });

  describe('Neutron quotas', () => {
    it('renders editable inputs for all 4 Neutron quota fields', () => {
      renderDialog();
      expect(screen.getByTestId('quota-floating_ip_count')).toBeInTheDocument();
      expect(screen.getByTestId('quota-network_count')).toBeInTheDocument();
      expect(screen.getByTestId('quota-subnet_count')).toBeInTheDocument();
      expect(screen.getByTestId('quota-port_count')).toBeInTheDocument();
    });

    it('sets min=-1 on Neutron quota inputs (allows -1 for unlimited)', () => {
      renderDialog();
      expect(screen.getByTestId('quota-floating_ip_count')).toHaveAttribute(
        'min',
        '-1',
      );
      expect(screen.getByTestId('quota-network_count')).toHaveAttribute(
        'min',
        '-1',
      );
    });

    it('sends Neutron quota values as plain counts (no MiB conversion)', async () => {
      const user = userEvent.setup();
      vi.mocked(openstackTenantsSetQuotas).mockResolvedValue({} as any);

      renderDialog();

      const floatingIpInput = screen.getByTestId('quota-floating_ip_count');
      await user.clear(floatingIpInput);
      await user.type(floatingIpInput, '25');

      await user.click(screen.getByRole('button', { name: /Save/i }));

      await waitFor(() => {
        expect(openstackTenantsSetQuotas).toHaveBeenCalledWith(
          expect.objectContaining({
            body: expect.objectContaining({
              floating_ip_count: 25,
            }),
          }),
        );
      });
    });
  });

  describe('Derived quota tooltips', () => {
    it('shows tooltip text on volumes_size read-only row', () => {
      renderDialog();
      // The tooltip trigger (underlined label) should be present
      expect(screen.getByText('Volumes size')).toBeInTheDocument();
    });

    it('shows tooltip text on snapshots_size read-only row', () => {
      renderDialog();
      expect(screen.getByText('Snapshots size')).toBeInTheDocument();
    });
  });

  describe('Difference column units', () => {
    it('shows no % sign for count quotas (vcpu)', async () => {
      const user = userEvent.setup();
      renderDialog();

      const vcpuInput = getInputByQuotaName('vCPU count');
      await user.clear(vcpuInput);
      await user.type(vcpuInput, '20');

      // Difference badge should show +12 (20-8) with no percent
      const badge = await screen.findByText('+12');
      expect(badge).toBeInTheDocument();
      expect(badge.textContent).not.toContain('%');
    });

    it('shows GB unit for storage difference', async () => {
      const user = userEvent.setup();
      renderDialog();

      const storageInput = getInputByQuotaName('Storage');
      await user.clear(storageInput);
      await user.type(storageInput, '15');

      // Difference badge should show +5 GB (15-10)
      const badge = await screen.findByText('+5 GB');
      expect(badge).toBeInTheDocument();
    });
  });
});
