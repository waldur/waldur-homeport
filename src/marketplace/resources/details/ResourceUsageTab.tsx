import { Resource } from 'waldur-js-client';

import { SpendingLimitStatusCard } from './SpendingLimitStatusCard';
import { UsageCard } from './UsageCard';

/** The Usage tab: the resource's spending limits, then its usage history. */
export const ResourceUsageTab = ({ resource }: { resource: Resource }) => (
  <>
    <SpendingLimitStatusCard resource={resource} />
    <UsageCard resource={resource} />
  </>
);
