import { Project } from 'waldur-js-client';

import { useOrganizationAndProjectAutocompletesForResources } from '@/navigation/sidebar/resources-filter/utils';
import { IBreadcrumbItem } from '@/navigation/types';
import { Customer } from '@/workspace/types';

export const usePresetBreadcrumbItems = () => {
  const { syncResourceFilters } =
    useOrganizationAndProjectAutocompletesForResources();

  const getOrganizationBreadcrumbItem = (
    customer: Partial<Customer>,
    options: Partial<IBreadcrumbItem> = {},
  ): IBreadcrumbItem => ({
    key: 'organization.dashboard',
    text: customer.name,
    to: 'organization.dashboard',
    params: { uuid: customer.uuid },
    ellipsis: 'xl',
    truncate: true,
    onClick: () =>
      syncResourceFilters({ organization: customer, project: null }),
    ...options,
  });

  const getProjectBreadcrumbItem = (
    project: Partial<Project>,
    options: Partial<IBreadcrumbItem> = {},
  ): IBreadcrumbItem => ({
    key: 'project.dashboard',
    text: project.name,
    to: 'project.dashboard',
    params: { uuid: project.uuid },
    ellipsis: 'xl',
    truncate: true,
    onClick: () =>
      syncResourceFilters({
        organization: {
          uuid: project.customer_uuid,
          name: project.customer_name,
        },
        project,
      }),
    ...options,
  });

  return { getOrganizationBreadcrumbItem, getProjectBreadcrumbItem };
};
