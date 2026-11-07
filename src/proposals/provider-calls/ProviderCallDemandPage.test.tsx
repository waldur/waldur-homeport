import { screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { proposalOfferingDemandList } from 'waldur-js-client';

import { DrawerProvider } from '@/drawer/DrawerContext';
import { renderWithProviders } from '@/test/harness';
import { useCustomer } from '@/workspace/hooks';

import { groupDemandRows } from './offeringDemand';
import {
  DemandComponentsRow,
  ProviderCallDemandPage,
} from './ProviderCallDemandPage';

const list = vi.mocked(proposalOfferingDemandList);

const gpu = {
  type: 'gpu_hours',
  name: 'GPU hours',
  measured_unit: 'hours',
  limit_period: 'total',
  call_pool: { offered: 120_000, awarded: 20_000, remaining: 100_000 },
  round_pool: { offered: 50_000, awarded: 20_000, remaining: 30_000 },
};

const base = {
  offering_uuid: 'o1',
  offering_name: 'Booster partition',
  provider_uuid: 'provider1',
  provider_name: 'South',
  requested_offering_uuid: 'ro1',
  call_uuid: 'c1',
  call_name: 'Extreme Scale',
  call_state: 'active',
  round_uuid: 'r1',
  round_name: 'Spring round',
  round_start_time: '2026-03-01T00:00:00Z',
  round_cutoff_time: '2026-04-01T00:00:00Z',
  round_status: 'ended',
};

const rows = [
  {
    ...base,
    state_group: 'accepted',
    proposals_count: 1,
    components: [{ ...gpu, requested: 30_000, awarded: 20_000 }],
  },
  { ...base, state_group: 'closed', proposals_count: 1, components: [] },
  {
    ...base,
    round_uuid: 'r2',
    round_name: 'Autumn round',
    round_status: 'open',
    state_group: 'pending',
    proposals_count: 2,
    components: [
      {
        ...gpu,
        requested: 25_000,
        awarded: null,
        round_pool: { offered: 60_000, awarded: 0, remaining: 60_000 },
      },
    ],
  },
];

const renderPage = () =>
  renderWithProviders(
    <DrawerProvider>
      <Provider store={configureStore()({ tables: {} })}>
        <ProviderCallDemandPage />
      </Provider>
    </DrawerProvider>,
  );

describe('ProviderCallDemandPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCustomer).mockReturnValue({
      uuid: 'provider1',
      name: 'South',
    } as any);
  });

  it('lists a row per offering, call and round with the proposal counts', async () => {
    list.mockResolvedValue({ data: rows } as any);
    renderPage();
    expect(await screen.findByText('Spring round')).toBeInTheDocument();
    expect(screen.getByText('Autumn round')).toBeInTheDocument();
    expect(screen.getAllByText('Booster partition')).toHaveLength(2);
    expect(screen.getAllByText('Extreme Scale')).toHaveLength(2);
    // Autumn: two pending; Spring: one accepted, one closed.
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getAllByText('1')).toHaveLength(2);
    expect(list).toHaveBeenCalledWith({
      query: expect.objectContaining({ provider_uuid: 'provider1' }),
    });
  });

  it('opens a round to its amounts per component and the pools', async () => {
    list.mockResolvedValue({ data: rows } as any);
    const [spring] = groupDemandRows(rows as any);
    renderWithProviders(
      <DrawerProvider>
        <Provider store={configureStore()({ tables: {} })}>
          <DemandComponentsRow row={spring} />
        </Provider>
      </DrawerProvider>,
    );
    expect(await screen.findByText('20K')).toBeInTheDocument();
    expect(screen.getByText('30K')).toBeInTheDocument();
    expect(screen.getByText('30K of 50K left')).toBeInTheDocument();
    expect(screen.getByText('100K of 120K left')).toBeInTheDocument();
  });

  it('says when no proposal asks for the provider yet', async () => {
    list.mockResolvedValue({ data: [] } as any);
    renderPage();
    expect(
      await screen.findByText(
        'No submitted proposal asks for an offering of this provider yet.',
      ),
    ).toBeInTheDocument();
  });
});
