import { get, getAll } from '@waldur/core/api';

import { Event, EventStat } from './types';

export const getEvents = (params) =>
  getAll<Event>('/events/', {
    params,
  });

export const getEventStats = (params) =>
  get<EventStat[]>('/events-stats/', { params }).then(
    (response) => response.data,
  );
