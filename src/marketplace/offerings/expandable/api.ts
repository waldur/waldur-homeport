import { AxiosRequestConfig } from 'axios';
import { DateTime } from 'luxon';

import { getAll } from '@waldur/core/api';
import { ComponentUsage } from '@waldur/marketplace/resources/usage/types';

export const getProviderOfferingCostChartData = (
  accounting_is_running: boolean,
  offeringUuid: string,
) =>
  getAll(`/marketplace-provider-offerings/${offeringUuid}/costs/`, {
    params: {
      accounting_is_running,
      start: DateTime.now().minus({ months: 11 }).toFormat('yyyy-MM'),
      end: DateTime.now().toFormat('yyyy-MM'),
    },
  }).then((response) => response);

export const getProviderOfferingComponentStats = (
  offeringUuid: string,
  options?: AxiosRequestConfig,
) =>
  getAll<ComponentUsage>(
    `/marketplace-provider-offerings/${offeringUuid}/component_stats/`,
    options,
  );
