import { OfferingUser } from 'waldur-js-client';

import { AtLeast } from '@/core/types';

export type OfferingUserRecord = AtLeast<
  OfferingUser,
  'offering_uuid' | 'user_uuid' | 'username'
> & {
  /** The offering shares accounts: the username comes from the provider account. */
  provider_account?: boolean;
};

export interface RecordStatus {
  status: 'ready' | 'created' | 'erred';
  data: OfferingUserRecord;
  error?: any;
}
