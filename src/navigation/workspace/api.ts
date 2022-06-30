import Axios from 'axios';

import { ENV } from '@waldur/configs/default';
import { get, parseResultCount } from '@waldur/core/api';

export const getCustomersCount = () =>
  Axios.head(`${ENV.apiEndpoint}api/customers/`).then((response) =>
    parseResultCount(response),
  );

export const getCustomersPage = (query, page, pageSize, isServiceProvider?) =>
  Axios.get(`${ENV.apiEndpoint}api/customers/`, {
    params: {
      page: page + 1,
      page_size: pageSize,
      field: [
        'name',
        'uuid',
        'projects',
        'owners',
        'service_managers',
        'abbreviation',
        'is_service_provider',
      ],
      o: 'name',
      query,
      is_service_provider: isServiceProvider,
    },
  }).then((response) => ({
    pageElements: response.data,
    itemCount: parseResultCount(response),
  }));

export const getProjectCounters = (projectUuid: string) =>
  get(`/projects/${projectUuid}/counters/`).then((response) => response.data);
