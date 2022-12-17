export const serializeNotification = (formData) => ({
  subject: formData.subject,
  body: formData.body,
  query: {
    customers: formData.customers?.map((c) => c.uuid),
    offerings: formData.offerings?.map((c) => c.uuid),
  },
  send_at: formData.send_at,
});

export const parseNotification = (notification) => ({
  subject: notification.subject,
  body: notification.body,
  offerings: notification.query.offerings,
  customers: notification.query.customers,
  send_at: notification.send_at,
});
