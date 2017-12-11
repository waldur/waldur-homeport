import { createFetcher } from '@waldur/table-react';
import { alertFormatter } from './services';

export const fetchAlerts = request => createFetcher('alerts')(request).then(response => ({
  ...response,
  rows: response.rows.map(alert => ({
    ...alert,
    html_message: alertFormatter.format(alert)
  }))
}));
