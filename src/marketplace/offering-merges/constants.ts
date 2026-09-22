import { OfferingMergeStateEnum } from 'waldur-js-client';

import { SITE_AGENT_PLUGIN } from '@/site-agent/constants';
import {
  BASIC_OFFERING_TYPE,
  SUPPORT_OFFERING_TYPE,
} from '@/support/constants';

/** Types without a backend scope object, mergeable between themselves. */
export const CROSS_TYPE_MERGEABLE_TYPES: string[] = [
  BASIC_OFFERING_TYPE,
  SUPPORT_OFFERING_TYPE,
  SITE_AGENT_PLUGIN,
];

export const EDITABLE_STATES: OfferingMergeStateEnum[] = ['draft', 'previewed'];

/** A failed merge may be previewed and run again. */
export const PREVIEWABLE_STATES: OfferingMergeStateEnum[] = [
  'draft',
  'previewed',
  'failed',
];

/** States a Celery task is still working on. */
export const ACTIVE_STATES: OfferingMergeStateEnum[] = [
  'queued',
  'running',
  'undoing',
];

export const POLL_INTERVAL = 3000;

export const MERGES_TABLE_ID = 'OfferingMerges';

export const MERGE_QUERY_KEY = (uuid: string) => ['OfferingMerge', uuid];

export const WIZARD_STATE = 'admin-marketplace-offering-merge-wizard';
export const DETAILS_STATE = 'admin-marketplace-offering-merge-details';
export const LIST_STATE = 'admin-marketplace-offering-merges';
