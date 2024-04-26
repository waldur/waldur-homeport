import { getList, post } from '@waldur/core/api';

import { NotificationMessageTemplate } from './types';

export const getNotificationMessagesTemplates = (params?: {}) => {
  return getList<NotificationMessageTemplate>(
    '/notification-messages-templates/',
    params,
  );
};

export const overrideNotificationTemplate = (url, content) => {
  return post(`${url}override/`, content);
};

export const enableNotification = (url) => {
  return post(`${url}enable/`);
};

export const disableNotification = (url) => {
  return post(`${url}disable/`);
};
