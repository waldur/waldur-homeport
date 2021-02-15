import { getAll } from '@waldur/core/api';

import { Event } from './types';

export const getEvents = (params) =>
  getAll<Event>('/events/', {
    params,
  });
