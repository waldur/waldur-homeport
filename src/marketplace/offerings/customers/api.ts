import * as moment from 'moment-timezone';

import { getAll } from '@waldur/core/api';
import { formatDateToYearMonth } from '@waldur/core/dateUtils';
import { ENV } from '@waldur/core/services';
import { parseResponse } from '@waldur/table/api';
import { Fetcher, TableRequest } from '@waldur/table/types';

export const fetchOfferingCustomers: Fetcher = (request: TableRequest) => {
  const { offering_uuid, ...rest } = request.filter;
  const url = `${ENV.apiEndpoint}api/marketplace-offerings/${offering_uuid}/customers/`;
  const params = {
    page: request.currentPage,
    page_size: request.pageSize,
    ...rest,
  };
  return parseResponse(url, params);
};

export const getOfferingCostChartData = (
  accounting_is_running: boolean,
  offeringUuid: string,
) =>
  getAll(`/marketplace-offerings/${offeringUuid}/costs/`, {
    params: {
      accounting_is_running,
      start: formatDateToYearMonth(moment().subtract(11, 'months')),
      end: formatDateToYearMonth(moment()),
    },
  }).then((response) => response);
