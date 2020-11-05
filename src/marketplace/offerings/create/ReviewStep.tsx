import * as React from 'react';

import { AccountingSummary } from './AccountingSummary';
import { DescriptionSummary } from './DescriptionSummary';
import { ManagementSummary } from './ManagementSummary';
import { OverviewSummary } from './OverviewSummary';

export const ReviewStep = () => (
  <>
    <OverviewSummary />
    <ManagementSummary />
    <DescriptionSummary />
    <AccountingSummary />
  </>
);
