import { DateTime } from 'luxon';

import { ENV } from '@waldur/configs/default';
import { getAll } from '@waldur/core/api';
import { ComponentUsage } from '@waldur/marketplace/resources/usage/types';
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
      start: DateTime.now().minus({ months: 11 }).toFormat('yyyy-MM'),
      end: DateTime.now().toFormat('yyyy-MM'),
    },
  }).then((response) => response);

export const getOfferingComponentStats = (offeringUuid: string) =>
  getAll<ComponentUsage>(
    `/marketplace-offerings/${offeringUuid}/component_stats/`,
  );
