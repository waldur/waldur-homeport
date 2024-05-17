import { advanceTo, clear } from 'jest-date-mock';

import * as marketplaceApi from '@waldur/marketplace/common/api';
import { ComponentUsage } from '@waldur/marketplace/resources/usage/types';
import * as slurmApi from '@waldur/slurm/details/api';

import componentUsages from './fixtures/component-usages.json';
import userUsages from './fixtures/user-usages.json';
import { loadCharts } from './utils';

jest.mock('@waldur/slurm/details/api');
jest.mock('@waldur/marketplace/common/api');

const slurmApiMock = slurmApi as jest.Mocked<typeof slurmApi>;
const marketplaceApiMock = marketplaceApi as jest.Mocked<typeof marketplaceApi>;

describe('SLURM allocation usage chart formatter', () => {
  beforeEach(() => {
    advanceTo(new Date(2020, 6, 1));
    slurmApiMock.getAllocationUserUsages.mockResolvedValue(userUsages);
    marketplaceApiMock.getComponentUsages.mockResolvedValue(
      componentUsages as ComponentUsage[],
    );
  });

  afterEach(() => {
    clear();
  });

  it('parses data and returns eChart option correctly', async () => {
    const charts = await loadCharts('allocationUrl', 'resourceUuid');
    expect(charts).toMatchSnapshot();
  });
});
