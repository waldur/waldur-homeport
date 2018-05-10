import * as moment from 'moment';

import { getList } from '@waldur/core/api';

export const fetchProjects = (organizationUuid: string) =>
  getList('/projects/', { customer: organizationUuid });

export const fetchQuotaHistory = (quotaUuid: string) => {
  const url = `/quotas/${quotaUuid}/history/`;
  const end = +moment().format('X');
  const start = end - 60 * 60 * 24 * 30;
  const pointsCount = 15;
  return getList(url, {
    start,
    end,
    points_count: pointsCount,
  });
};
