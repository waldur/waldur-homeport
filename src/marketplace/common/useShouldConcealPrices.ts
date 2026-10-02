import { useQuery } from '@tanstack/react-query';
import { projectsRetrieve, User } from 'waldur-js-client';

import { STALE_TIME } from '@/core/constants';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { useUser } from '@/workspace/hooks';

/**
 * Whether the user holds a role through which the project is readable: one on
 * the project itself or on its organization. A provider looking at an order
 * placed by another organization holds neither, and the project lookup would
 * only come back 404.
 */
const canReadConsumerProject = (
  user: Pick<User, 'is_staff' | 'is_support' | 'permissions'>,
  projectUuid?: string,
  customerUuid?: string,
): boolean => {
  if (!user || !projectUuid) {
    return false;
  }
  if (user.is_staff || user.is_support) {
    return true;
  }
  return (
    user.permissions?.some(
      ({ scope_type, scope_uuid }) =>
        (scope_type === 'project' && scope_uuid === projectUuid) ||
        (scope_type === 'customer' &&
          !!customerUuid &&
          scope_uuid === customerUuid),
    ) ?? false
  );
};

/**
 * The consumer organization can hide billing information in its projects.
 * That setting concerns the consumer's own members only, so it is looked up
 * just for users who can read the consumer project.
 */
export const useShouldConcealPrices = (
  projectUuid?: string,
  customerUuid?: string,
) => {
  const user = useUser();
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
    enabled:
      !globalConceal && canReadConsumerProject(user, projectUuid, customerUuid),
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  return (
    globalConceal ||
    project?.customer_display_billing_info_in_projects === false
  );
};
