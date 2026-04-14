import { marketplaceStatsTotalCostOfActiveResourcesPerOfferingList } from 'waldur-js-client';

import { createFetcher } from '@waldur/table/api';

export const offeringCostsFetcher = createFetcher(
  marketplaceStatsTotalCostOfActiveResourcesPerOfferingList,
);
