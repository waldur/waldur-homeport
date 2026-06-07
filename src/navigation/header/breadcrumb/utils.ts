import { useSelector } from 'react-redux';
import { Project } from 'waldur-js-client';

import { canAccessOrganization } from '@/customer/utils';
import { translate } from '@/i18n';
import { useOrganizationAndProjectAutocompletesForResources } from '@/navigation/sidebar/resources-filter/utils';
import { IBreadcrumbItem } from '@/navigation/types';
import { Customer } from '@/workspace/types';

export const usePresetBreadcrumbItems = () => {
  const { syncResourceFilters } =
    useOrganizationAndProjectAutocompletesForResources();
  const canVisitOrganization = useSelector(canAccessOrganization);

  const getOrganizationsBreadcrumbItem = (
    options: Partial<IBreadcrumbItem> = {},
  ): IBreadcrumbItem => ({
    key: 'organizations',
    text: translate('Organizations'),
    ...(canVisitOrganization ? { to: 'organizations' } : {}),
    ...options,
  });

  const getOrganizationBreadcrumbItem = (
    customer: Partial<Customer>,
    options: Partial<IBreadcrumbItem> = {},
  ): IBreadcrumbItem => ({
    key: 'organization.dashboard',
    text: customer.name,
    ...(canVisitOrganization
      ? {
          to: 'organization.dashboard',
          params: { uuid: customer.uuid },
          onClick: () =>
            syncResourceFilters({ organization: customer, project: null }),
        }
      : {}),
    ellipsis: 'xl',
    truncate: true,
    ...options,
  });

  const getOrganizationProjectsBreadcrumbItem = (
    customerUuid: string,
    options: Partial<IBreadcrumbItem> = {},
  ): IBreadcrumbItem => ({
    key: 'organization.projects',
    text: translate('Projects'),
    ...(canVisitOrganization
      ? {
          to: 'organization.projects',
          params: { uuid: customerUuid },
        }
      : {}),
    ellipsis: 'xl',
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

  return {
    getOrganizationsBreadcrumbItem,
    getOrganizationBreadcrumbItem,
    getOrganizationProjectsBreadcrumbItem,
    getProjectBreadcrumbItem,
  };
};
