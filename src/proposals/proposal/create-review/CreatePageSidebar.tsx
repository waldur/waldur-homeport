import { PageBarTabs } from '@waldur/marketplace/common/PageBarTabs';

import { createReviewSteps } from './steps/steps';

const tabs = createReviewSteps.map((step) => ({
  key: step.id,
  title: step.label,
}));

export const CreatePageSidebar = () => (
  <PageBarTabs tabs={tabs} mode="tabs-left" />
);
