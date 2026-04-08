import { useQuery } from '@tanstack/react-query';
import { projectsRetrieve } from 'waldur-js-client';

import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';

export const useShouldConcealPrices = (projectUuid?: string) => {
  const globalConceal = isFeatureVisible(MarketplaceFeatures.conceal_prices);

  const getErrorStatus = (error: any) =>
    error?.response?.status || error?.status;

  const { data: project } = useQuery({
    queryKey: ['display-project-billing', projectUuid],
    queryFn: () =>
      projectsRetrieve({
        path: { uuid: projectUuid },
        query: { field: ['customer_display_billing_info_in_projects'] },
      })
        .then((response) => response.data)
        .catch((error) => {
          if (getErrorStatus(error) === 404) {
            return null;
          }
          throw error;
        }),
    enabled: !!projectUuid && !globalConceal,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  return (
    globalConceal ||
    project?.customer_display_billing_info_in_projects === false
  );
};
