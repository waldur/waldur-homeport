import {
  BroadcastFormData,
  BroadcastRequestData,
  BroadcastResponseData,
} from './types';

export const serializeBroadcast = (
  formData: BroadcastFormData,
): BroadcastRequestData => ({
  subject: formData.subject,
  body: formData.body,
  query: {
    customers: formData.customers?.map((c) => c.uuid),
    offerings: formData.offerings?.map((c) => c.uuid),
    all_users: formData.all_users,
  },
  send_at: formData.send_at,
});

export const parseBroadcast = (
  broadcast: BroadcastResponseData,
): BroadcastFormData => ({
  subject: broadcast.subject,
  body: broadcast.body,
  offerings: broadcast.query.offerings,
  customers: broadcast.query.customers,
  all_users: broadcast.query.all_users,
  send_at: broadcast.send_at,
});
