import { UIView } from '@uirouter/react';

import { useReportingTabs } from '@waldur/issues/workspace/SupportWorkspace';

export const ReportingContainer = () => {
  useReportingTabs();
  return <UIView />;
};
