import { FunctionComponent } from 'react';

import { Panel } from '@waldur/core/Panel';
import { translate } from '@waldur/i18n';
import { useReportingBreadcrumbs } from '@waldur/issues/workspace/SupportWorkspace';
import { useTitle } from '@waldur/navigation/title';

import { PlanUsageFilter } from './PlanUsageFilter';
import { PlanUsageList } from './PlanUsageList';

export const PlanUsageContainer: FunctionComponent = () => {
  useTitle(translate('Plan capacity'));
  useReportingBreadcrumbs();
  return (
    <Panel>
      <PlanUsageFilter />
      <PlanUsageList />
    </Panel>
  );
};
