import { client } from 'waldur-js-client/client.gen';

import { OfferingComponentUsage } from './types';

export const getComponentUsageMonthlyList = (options?: any) =>
  client.get<OfferingComponentUsage[]>({
    url: '/api/marketplace-component-usage-monthly/',
    ...options,
    security: [
      {
        name: 'Authorization',
        type: 'apiKey',
      },
    ],
  });
