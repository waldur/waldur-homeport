import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';

import {
  getCategories,
  getPublicOfferingsList,
} from '@waldur/marketplace/common/api';
import {
  getWorkspace,
  getCustomer,
  getProject,
} from '@waldur/workspace/selectors';
import { WorkspaceType, USER_WORKSPACE } from '@waldur/workspace/types';

export function useLandingCategories() {
  const customer = useSelector(getCustomer);
  const project = useSelector(getProject);
  const options = {
    params: {
      allowed_customer_uuid: customer?.uuid,
      project_uuid: project?.uuid,
      has_offerings: true,
      field: ['uuid', 'icon', 'title', 'offering_count'],
    },
  };
  return useQuery({
    queryKey: ['landing-categories', customer?.uuid, project?.uuid],
    queryFn: () => getCategories(options),
    staleTime: 5 * 60 * 1000,
  });
}

export function useLandingOfferings() {
  const customer = useSelector(getCustomer);
  const project = useSelector(getProject);
  const workspace: WorkspaceType = useSelector(getWorkspace);
  const field = [
    'uuid',
    'name',
    'description',
    'thumbnail',
    'rating',
    'order_count',
    'category_uuid',
    'attributes',
    'customer_name',
    'customer_uuid',
    'state',
    'paused_reason',
  ];
  const params: Record<string, any> = {
    page_size: 6,
    o: '-created',
    state: ['Active', 'Paused'],
    field,
    allowed_customer_uuid: customer?.uuid,
    project_uuid: project?.uuid,
  };
  if (workspace === USER_WORKSPACE) {
    params.shared = true;
  }
  return useQuery({
    queryKey: ['landing-offerings', customer?.uuid, project?.uuid],
    queryFn: () => getPublicOfferingsList(params),
    staleTime: 5 * 60 * 1000,
  });
}

export type CategoriesQueryResult = ReturnType<typeof useLandingCategories>;

export type OfferingsQueryResult = ReturnType<typeof useLandingOfferings>;
