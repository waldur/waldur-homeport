import { getList, getSelectData, post, put, remove } from '@waldur/core/api';

import {
  MessageTemplate,
  NotificationMessageTemplate,
  NotificationRequestData,
  NotificationTemplateRequestData,
} from './types';

export const sendNotification = (uuid: string) =>
  post(`/broadcast-messages/${uuid}/send/`);

export const createNotification = (payload: NotificationRequestData) =>
  post('/broadcast-messages/', payload);

export const updateNotification = (uuid, payload: NotificationRequestData) =>
  put(`/broadcast-messages/${uuid}/`, payload);

export const getTemplateList = (params?: {}) =>
  getSelectData<MessageTemplate>('/broadcast-message-templates/', params);

export const getNotificationMessagesTemplates = (params?: {}) => {
  return getList<NotificationMessageTemplate>(
    '/notification-messages-templates/',
    params,
  );
};

export const createNotificationTemplate = (
  payload: NotificationTemplateRequestData,
) => post('/broadcast-message-templates/', payload);

export const deleteNotificationTemplate = (uuid) =>
  remove(`/broadcast-message-templates/${uuid}/`);

export const updateNotificationTemplate = (uuid, payload) =>
  put(`/broadcast-message-templates/${uuid}/`, payload);
