import Axios from 'axios';

import { ENV } from '@waldur/configs/default';
import { parseResultCount } from '@waldur/core/api';

export const getCustomersCount = () =>
  Axios.head(`${ENV.apiEndpoint}api/customers/`).then((response) =>
    parseResultCount(response),
  );

export const getCustomersPage = (query, page) =>
  Axios.get(`${ENV.apiEndpoint}api/customers/`, {
    params: {
      page: page + 1,
      page_size: ENV.pageSize,
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
    },
  }).then((response) => ({
    pageElements: response.data,
    itemCount: parseResultCount(response),
  }));
