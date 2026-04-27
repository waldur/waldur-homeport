import { marketplaceStatsTotalCostOfActiveResourcesPerOfferingList } from 'waldur-js-client';

import { createFetcher } from '@/table/api';

export const offeringCostsFetcher = createFetcher(
  marketplaceStatsTotalCostOfActiveResourcesPerOfferingList,
);
