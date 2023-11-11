import { getList } from '@waldur/core/api';
import { NotificationMessageTemplate } from '@waldur/notifications/types';

export const getNotificationMessagesTemplates = (params?: {}) => {
  return getList<NotificationMessageTemplate>(
    '/notification-messages-templates/',
    params,
  );
};
