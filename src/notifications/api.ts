import { getList, post } from '@waldur/core/api';
import { NotificationMessageTemplate } from '@waldur/notifications/types';

export const getNotificationMessagesTemplates = (params?: {}) => {
  return getList<NotificationMessageTemplate>(
    '/notification-messages-templates/',
    params,
  );
};

export const overrideNotificationTemplate = (url, content) => {
  return post(`${url}override/`, content);
};
