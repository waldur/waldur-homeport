import { createFetcher } from '@waldur/table-react';

import { eventFormatter } from './event-formatter';

export const fetchEvents = request => createFetcher('events')(request).then(response => {
  const rows = response.rows.filter(
    // filter out issue update events as there are too many of them.
    event => event.event_type && event.event_type !== 'issue_update_succeeded'
  ).map(event => ({
    ...event,
    html_message: eventFormatter(event),
    created: event['@timestamp'],
  }));
  return {...response, rows};
});
