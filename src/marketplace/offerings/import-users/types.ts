import { OfferingUser } from 'waldur-js-client';

import { AtLeast } from '@/core/types';

export type OfferingUserRecord = AtLeast<
  OfferingUser,
  'offering_uuid' | 'user_uuid' | 'username'
>;

export interface RecordStatus {
  status: 'ready' | 'created' | 'erred';
  data: OfferingUserRecord;
  error?: any;
}
