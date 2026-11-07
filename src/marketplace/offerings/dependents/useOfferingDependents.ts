import { useQuery } from '@tanstack/react-query';
import {
  marketplaceProviderOfferingsDependentsList,
  OfferingDependent,
  OfferingDependentChangeEnum,
} from 'waldur-js-client';

import { useUser } from '@/workspace/hooks';

import { getDependentsBlock } from './utils';

interface DependentsOptions {
  planUuid?: string;
  componentType?: string;
  enabled?: boolean;
}

/**
 * What calls and other apps have built on the offering, its plan or its
 * component, for the change about to be made; and whether that refuses it
 * for the viewer.
 */
export const useOfferingDependents = (
  offeringUuid: string | undefined,
  change: OfferingDependentChangeEnum,
  { planUuid, componentType, enabled = true }: DependentsOptions = {},
) => {
  const user = useUser();
  const query = useQuery<OfferingDependent[]>({
    queryKey: [
      'offering-dependents',
      offeringUuid,
      change,
      planUuid,
      componentType,
    ],
    queryFn: async () => {
      const { data } = await marketplaceProviderOfferingsDependentsList({
        path: { uuid: offeringUuid },
        query: {
          change,
          ...(planUuid ? { plan_uuid: planUuid } : {}),
          ...(componentType ? { component_type: componentType } : {}),
        },
      });
      return data;
    },
    enabled: enabled && !!offeringUuid,
    refetchOnWindowFocus: false,
  });
  const dependents = query.data ?? [];
  return {
    dependents,
    isLoading: query.isLoading,
    ...getDependentsBlock(dependents, Boolean(user?.is_staff)),
  };
};
