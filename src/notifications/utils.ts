import {
  NotificationFormData,
  NotificationRequestData,
  NotificationResponseData,
} from './types';

export const serializeNotification = (
  formData: NotificationFormData,
): NotificationRequestData => ({
  subject: formData.subject,
  body: formData.body,
  query: {
    customers: formData.customers?.map((c) => c.uuid),
    offerings: formData.offerings?.map((c) => c.uuid),
    all_users: formData.all_users,
  },
  send_at: formData.send_at,
});

export const parseNotification = (
  notification: NotificationResponseData,
): NotificationFormData => ({
  subject: notification.subject,
  body: notification.body,
  offerings: notification.query.offerings,
  customers: notification.query.customers,
  all_users: notification.query.all_users,
  send_at: notification.send_at,
});
