import { getSelectData, post, put } from '@waldur/core/api';

import { MessageTemplate, NotificationRequestData } from './types';

export const sendNotification = (uuid: string) =>
  post(`/broadcast_messages/${uuid}/send/`);

export const createNotification = (payload: NotificationRequestData) =>
  post('/broadcast_messages/', payload);

export const updateNotification = (uuid, payload: NotificationRequestData) =>
  put(`/broadcast_messages/${uuid}/`, payload);

export const getTemplateList = (params?: {}) =>
  getSelectData<MessageTemplate>('/broadcast_message_templates/', params);
