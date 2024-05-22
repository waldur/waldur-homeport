import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';

import { getCategories } from '@waldur/marketplace/common/api';
import { getCustomer, getProject } from '@waldur/workspace/selectors';

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
