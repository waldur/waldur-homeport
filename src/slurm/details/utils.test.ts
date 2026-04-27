import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  marketplaceComponentUsagesList,
  slurmAllocationUserUsageList,
} from 'waldur-js-client';

import componentUsages from './fixtures/component-usages.json';
import userUsages from './fixtures/user-usages.json';
import { loadCharts } from './utils';

vi.mock('waldur-js-client');
vi.mock('@/marketplace/common/api');

describe('SLURM allocation usage chart formatter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  beforeEach(() => {
    vi.setSystemTime(new Date(2020, 6, 1));
    vi.mocked(slurmAllocationUserUsageList).mockResolvedValue({
      data: userUsages,
    } as any);
    vi.mocked(marketplaceComponentUsagesList).mockResolvedValue({
      data: componentUsages,
    } as any);
  });

  it('parses data and returns eChart option correctly', async () => {
    const charts = await loadCharts('allocationUrl', 'resourceUuid');
    expect(charts).toMatchSnapshot();
  });
});
