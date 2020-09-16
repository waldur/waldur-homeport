import Axios from 'axios';

import { parseResultCount } from '@waldur/core/api';
import { ENV } from '@waldur/core/services';

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
