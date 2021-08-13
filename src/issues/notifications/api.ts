import { post } from '@waldur/core/api';

export const getNumberOfNotificationReceivers = (data) =>
  post(`/notifications/dry_run/`, data);
