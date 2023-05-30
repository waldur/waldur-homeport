import { get } from '@waldur/core/api';

import { EventStat } from './types';

export const getEventStats = (params) =>
  get<EventStat[]>('/events-stats/', { params }).then(
    (response) => response.data,
  );
