import { post } from '@waldur/core/api';

export const getNumberOfNotificationReceivers = (data) =>
  post(`/broadcast_messages/dry_run/`, data);
