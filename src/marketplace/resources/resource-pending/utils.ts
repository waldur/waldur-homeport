import { Resource } from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';

export const hasResourceChangePlanRequest = (resource: Resource) => {
  if (
    !resource.order_in_progress ||
    resource.order_in_progress.type !== 'Update'
  ) {
    return false;
  }
  const order = resource.order_in_progress;
  return (
    order.new_plan_uuid &&
    order.old_plan_uuid &&
    order.new_plan_uuid !== order.old_plan_uuid
  );
};

export const hasResourceLimitChangeRequest = (resource: Resource) => {
  if (
    !resource.order_in_progress ||
    resource.order_in_progress.type !== 'Update'
  ) {
    return false;
  }
  const attributes = resource.order_in_progress.attributes as any;
  return resource.order_in_progress.limits && attributes.old_limits;
};

/**
 * Timeline entries read "<actor>, <time>". Either half can be missing — an
 * auto-approved order has no reviewer — and `formatDateTime` renders the
 * current time when handed nothing, which made such an entry's timestamp
 * move on every page load. Drop the missing halves instead.
 */
export const formatTimelineEntry = (
  actor: string | null | undefined,
  date: string | null | undefined,
) => [actor, date ? formatDateTime(date) : null].filter(Boolean).join(', ');
