import {
  OfferingMergeEffectEnum,
  OfferingMergeStateEnum,
} from 'waldur-js-client';

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

/** The effect of an entry whose rows deliberately stay with the source. */
export const KEPT_ON_SOURCE_EFFECT: OfferingMergeEffectEnum = 'kept_on_source';

/**
 * States in which the drill-down reads the journal of what was written rather
 * than recomputing the plan. A row the merge never wrote — one kept on the
 * source, or one a deduplicated entry left behind — has no journal entry, so
 * there is nothing for it to list.
 */
export const JOURNALLED_STATES: OfferingMergeStateEnum[] = [
  'done',
  'undoing',
  'undone',
];
