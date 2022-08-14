import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { useReportingTabs } from '@waldur/issues/workspace/SupportWorkspace';
import { useTitle } from '@waldur/navigation/title';

import { PlanUsageFilter } from './PlanUsageFilter';
import { PlanUsageList } from './PlanUsageList';

export const PlanUsageContainer: FunctionComponent = () => {
  useTitle(translate('Plan capacity'));
  useReportingTabs();
  return <PlanUsageList filters={<PlanUsageFilter />} />;
};
