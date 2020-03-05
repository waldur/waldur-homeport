import { ResourcePlanPeriod } from '../usage/types';

import { PERIOD_CHANGED } from './constants';

export const periodChanged = (period: ResourcePlanPeriod) => ({
  type: PERIOD_CHANGED,
  payload: {
    period,
  },
});
