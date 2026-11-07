import { translate } from '@/i18n';
import { AwardComparisonRow } from '@/proposals/awardedResources';

/**
 * How the order behind an allocated item went. Read defensively: older
 * backends do not send these fields, and the outcome then falls back to what
 * the resource link alone can say.
 */
export interface AllocationOrderInfo {
  order_state?: string | null;
  order_rejection_comment?: string | null;
}

/**
 * Why a line of the outcome has, or has not yet, a working resource.
 *
 * Allocation provisions every awarded item on an offering the provider has
 * accepted, creating the resource and its order together. So a line without a
 * resource was either not awarded or awarded on an offering the call can no
 * longer provision; a line with one is as far along as its order.
 */
export type OutcomeStatus =
  | 'allocated'
  | 'awaiting-approval'
  | 'awaiting-provider'
  | 'awaiting-start'
  | 'provisioning'
  | 'refused'
  | 'failed'
  | 'canceled'
  | 'not-awarded'
  | 'offering-not-accepted'
  | 'unknown';

export interface OutcomeStatusInput {
  resource: string | null;
  change?: AwardComparisonRow['change'];
  offeringState?: string | null;
  orderState?: string | null;
}

const ORDER_STATUS: Record<string, OutcomeStatus> = {
  done: 'allocated',
  'pending-consumer': 'awaiting-approval',
  'pending-provider': 'awaiting-provider',
  'pending-project': 'awaiting-start',
  'pending-start-date': 'awaiting-start',
  executing: 'provisioning',
  rejected: 'refused',
  erred: 'failed',
  canceled: 'canceled',
};

export const outcomeStatus = ({
  resource,
  change,
  offeringState,
  orderState,
}: OutcomeStatusInput): OutcomeStatus => {
  if (change === 'removed') {
    return 'not-awarded';
  }
  if (orderState && ORDER_STATUS[orderState]) {
    return ORDER_STATUS[orderState];
  }
  if (resource) {
    // A resource whose order the backend does not report: the link and the
    // resource's own state say the rest.
    return 'allocated';
  }
  if (offeringState && offeringState !== 'accepted') {
    return 'offering-not-accepted';
  }
  return 'unknown';
};

export const outcomeStatusLabel = (status: OutcomeStatus) =>
  ({
    allocated: translate('Allocated'),
    'awaiting-approval': translate('Awaiting approval'),
    'awaiting-provider': translate('Awaiting the provider'),
    'awaiting-start': translate('Waiting for the project to start'),
    provisioning: translate('Being provisioned'),
    refused: translate('Refused by the provider'),
    failed: translate('Provisioning failed'),
    canceled: translate('Canceled'),
    'not-awarded': translate('Not awarded'),
    'offering-not-accepted': translate('Offering not accepted for this call'),
    unknown: translate('Unknown'),
  })[status];

export const OUTCOME_STATUS_VARIANTS: Record<
  OutcomeStatus,
  'success' | 'info' | 'warning' | 'danger' | 'neutral'
> = {
  allocated: 'success',
  'awaiting-approval': 'info',
  'awaiting-provider': 'info',
  'awaiting-start': 'info',
  provisioning: 'info',
  refused: 'danger',
  failed: 'danger',
  canceled: 'neutral',
  'not-awarded': 'neutral',
  'offering-not-accepted': 'warning',
  unknown: 'neutral',
};

/**
 * "1 of 2 requests were allocated." — or nothing when every request was.
 * Items the call manager added count too: they are part of what the proposal
 * was granted.
 */
export const allocationSummary = (statuses: OutcomeStatus[]) => {
  if (!statuses.length) {
    return null;
  }
  const allocated = statuses.filter((s) => s === 'allocated').length;
  if (allocated === statuses.length) {
    return null;
  }
  return translate('{allocated} of {total} requests were allocated.', {
    allocated,
    total: statuses.length,
  });
};
