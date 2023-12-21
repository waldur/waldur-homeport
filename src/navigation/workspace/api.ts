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
        'is_call_managing_organization',
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
  get(`/projects/${projectUuid}/counters/`).then((response) => response.data);

export const getOrganizationCounters = (customerUuid: string) =>
  get(`/customers/${customerUuid}/counters/`).then((response) => response.data);
