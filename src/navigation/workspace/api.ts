import Axios from 'axios';

import { ENV } from '@waldur/configs/default';
import { get, parseResultCount } from '@waldur/core/api';

export const getCustomersCount = () =>
  Axios.head(`${ENV.apiEndpoint}api/customers/`, {
    params: { archived: false },
  }).then((response) => parseResultCount(response));

export const getCustomersPage = (
  query,
  page,
  pageSize,
  isServiceProvider?,
  showAllProjects?,
) =>
  Axios.get(`${ENV.apiEndpoint}api/customers/`, {
    params: {
      archived: false,
      page: page + 1,
      page_size: pageSize,
      field: [
        'name',
        'uuid',
        'projects',
        'role',
        'users_count',
        'abbreviation',
        'is_service_provider',
        'image',
        'projects_count',
        'call_managing_organization_uuid',
      ],
      o: 'name',
      query,
      is_service_provider: isServiceProvider,
      show_all_projects: showAllProjects,
    },
  }).then((response) => ({
    pageElements: response.data,
    itemCount: parseResultCount(response),
  }));

export const getProjectCounters = (projectUuid: string) =>
  get(`/marketplace-project-categories/${projectUuid}/`).then(
    (response) => response.data,
  );

export const getOrganizationCounters = (customerUuid: string) =>
  get(`/marketplace-customer-categories/${customerUuid}/`).then(
    (response) => response.data,
  );
