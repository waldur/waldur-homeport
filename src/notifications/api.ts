import { getSelectData, post, put } from '@waldur/core/api';

import { MessageTemplate, NotificationRequestData } from './types';

export const sendNotification = (uuid: string) =>
  post(`/broadcast-messages/${uuid}/send/`);

export const createNotification = (payload: NotificationRequestData) =>
  post('/broadcast-messages/', payload);

export const updateNotification = (uuid, payload: NotificationRequestData) =>
  put(`/broadcast-messages/${uuid}/`, payload);

export const getTemplateList = (params?: {}) =>
  getSelectData<MessageTemplate>('/broadcast-message-templates/', params);
