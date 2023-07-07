import { REMOTE_OFFERING_TYPE } from '@waldur/marketplace-remote/constants';

export const PENDING_CONSUMER_ORDERS_FILTER = {
  state: ['requested for approval'],
  can_approve_as_consumer: 'True',
};

export const PENDING_PROVIDER_ORDERS_FILTER = {
  offering_type: [REMOTE_OFFERING_TYPE, 'Marketplace.Basic'],
  state: 'executing',
  can_approve_as_service_provider: 'True',
};
