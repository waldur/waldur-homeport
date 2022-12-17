import { post, put } from '@waldur/core/api';

export const getNumberOfNotificationReceivers = (data) =>
  post(`/broadcast_messages/dry_run/`, data);

export const sendNotification = (uuid: string) =>
  post(`/broadcast_messages/${uuid}/send/`);

export const createNotification = (payload) =>
  post('/broadcast_messages/', payload);

export const updateNotification = (uuid, payload) =>
  put(`/broadcast_messages/${uuid}/`, payload);
