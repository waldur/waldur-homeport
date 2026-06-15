import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  marketplaceResourcesOfferingRetrieve,
  marketplaceResourcesUpdateLimits,
} from 'waldur-js-client';

import { MultiChangeLimitsDialog } from './MultiChangeLimitsDialog';

// waldur-js-client and @/store/notify are already mocked in test/setupTests.js.

vi.mock('@/i18n', () => ({ translate: (key) => key }));

vi.mock('@/marketplace/common/registry', () => ({
  // Components come from the (mocked) offering, so tests control them via the
  // offering-retrieve mock.
  filterOfferingComponents: (offering) => offering.components,
  // Serializer doubles every value to verify it is applied before the request.
  getFormLimitSerializer: () => (limits) =>
    Object.fromEntries(
      Object.entries(limits).map(([k, v]) => [k, (v as number) * 2]),
    ),
  getFormLimitParser: () => (limits) => limits,
}));

vi.mock('@/marketplace/offerings/store/limits', () => ({
  parseOfferingLimits: (offering) =>
    Object.fromEntries(
      offering.components.map((c) => [c.type, { min: 1, max: 100 }]),
    ),
}));

// User can approve orders → submit label resolves to "Submit".
vi.mock('@/marketplace/orders/actions/selectors', () => ({
  checkOrderCanBeApproved: () => true,
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const mockStore = configureStore();

const renderComponent = (props) =>
  render(
    <Provider store={mockStore({})}>
      <QueryClientProvider client={createTestQueryClient()}>
        <MultiChangeLimitsDialog {...props} />
      </QueryClientProvider>
    </Provider>,
  );

const mockRows = [
  {
    uuid: 'r1',
    name: 'VPC 1',
    project_name: 'Project A',
    limits: { cores: 4 },
  },
  {
    uuid: 'r2',
    name: 'VPC 2',
    project_name: 'Project B',
    limits: { cores: 8 },
  },
] as any;

describe('MultiChangeLimitsDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(marketplaceResourcesOfferingRetrieve).mockResolvedValue({
      data: {
        type: 'OpenStack.Tenant',
        components: [
          {
            type: 'cores',
            name: 'Cores',
            measured_unit: '',
            billing_type: 'limit',
          },
        ],
      },
    } as any);
  });

  it('renders an editable field and a per-component preview column per tenant', async () => {
    renderComponent({ resolve: { rows: mockRows, refetch: vi.fn() } });

    expect(await screen.findByText('Preview')).toBeInTheDocument();
    // "Cores" appears twice: the editable FormGroup label and the table column.
    expect(screen.getAllByText('Cores')).toHaveLength(2);
    expect(screen.getByText('VPC 1')).toBeInTheDocument();
    expect(screen.getByText('VPC 2')).toBeInTheDocument();
    expect(screen.getByText('Project A')).toBeInTheDocument();
    expect(screen.getByText('Project B')).toBeInTheDocument();
    // r1 is prefilled to its own value (4) -> no change; r2 (8) shows the
    // before -> after transition against the shared target (4).
    expect(screen.getByText('No change')).toBeInTheDocument();
    expect(screen.getByText('8 → 4')).toBeInTheDocument();
  });

  it('calls marketplaceResourcesUpdateLimits per tenant with serialized limits', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    vi.mocked(marketplaceResourcesUpdateLimits).mockResolvedValue({
      data: {},
    } as any);

    renderComponent({ resolve: { rows: mockRows, refetch } });

    // Field is prefilled from the first tenant's parsed limits (cores: 4).
    const input = await screen.findByRole('spinbutton');
    await user.clear(input);
    await user.type(input, '10');

    await user.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(marketplaceResourcesUpdateLimits).toHaveBeenCalledTimes(2);
    });
    // Serializer doubled cores 10 -> 20 for every tenant.
    expect(marketplaceResourcesUpdateLimits).toHaveBeenCalledWith({
      path: { uuid: 'r1' },
      body: { limits: { cores: 20 } },
    });
    expect(marketplaceResourcesUpdateLimits).toHaveBeenCalledWith({
      path: { uuid: 'r2' },
      body: { limits: { cores: 20 } },
    });
    await waitFor(() => expect(refetch).toHaveBeenCalled());
  });

  it('only makes the common components editable and lists the skipped ones', async () => {
    const offerings: Record<string, any> = {
      r1: {
        type: 'OpenStack.Tenant',
        components: [
          {
            type: 'cores',
            name: 'Cores',
            measured_unit: '',
            billing_type: 'limit',
          },
          {
            type: 'ram',
            name: 'RAM',
            measured_unit: 'GB',
            billing_type: 'limit',
          },
        ],
      },
      r2: {
        type: 'OpenStack.Tenant',
        components: [
          {
            type: 'cores',
            name: 'Cores',
            measured_unit: '',
            billing_type: 'limit',
          },
          {
            type: 'storage',
            name: 'Storage',
            measured_unit: 'GB',
            billing_type: 'limit',
          },
        ],
      },
    };
    vi.mocked(marketplaceResourcesOfferingRetrieve).mockImplementation(
      ({ path }: any) => Promise.resolve({ data: offerings[path.uuid] }) as any,
    );

    const rows = [
      {
        uuid: 'r1',
        name: 'VPC 1',
        project_name: 'Project A',
        offering_uuid: 'o1',
        limits: { cores: 2, ram: 4 },
      },
      {
        uuid: 'r2',
        name: 'VPC 2',
        project_name: 'Project B',
        offering_uuid: 'o2',
        limits: { cores: 2, storage: 10 },
      },
    ] as any;

    const user = userEvent.setup();
    vi.mocked(marketplaceResourcesUpdateLimits).mockResolvedValue({
      data: {},
    } as any);

    renderComponent({ resolve: { rows, refetch: vi.fn() } });

    // Only the common component (cores) is editable -> a single input.
    expect(await screen.findByRole('spinbutton')).toBeInTheDocument();
    expect(screen.getAllByRole('spinbutton')).toHaveLength(1);

    // Skipped-components info alert is shown.
    expect(
      screen.getByText('Some components are not editable here'),
    ).toBeInTheDocument();

    // The preview has a column for every component across the selection
    // (union), including the skipped ones.
    expect(screen.getByText('RAM (GB)')).toBeInTheDocument();
    expect(screen.getByText('Storage (GB)')).toBeInTheDocument();

    // Edit the common component and submit.
    const input = screen.getByRole('spinbutton');
    await user.clear(input);
    await user.type(input, '5');
    await user.click(screen.getByText('Submit'));

    await waitFor(() =>
      expect(marketplaceResourcesUpdateLimits).toHaveBeenCalledTimes(2),
    );
    // cores edited for both; each tenant keeps ONLY its own non-common
    // component (ram for r1, storage for r2) — no cross-leak, none dropped.
    // (Mock serializer doubles every value.)
    expect(marketplaceResourcesUpdateLimits).toHaveBeenCalledWith({
      path: { uuid: 'r1' },
      body: { limits: { cores: 10, ram: 8 } },
    });
    expect(marketplaceResourcesUpdateLimits).toHaveBeenCalledWith({
      path: { uuid: 'r2' },
      body: { limits: { cores: 10, storage: 20 } },
    });
  });
});
