import * as React from 'react';

import { Panel } from '@waldur/core/Panel';
import { translate } from '@waldur/i18n';
import { useReportingBreadcrumbs } from '@waldur/issues/workspace/SupportWorkspace';
import { useTitle } from '@waldur/navigation/title';

import { SupportUsageFilter } from './SupportUsageFilter';
import { SupportUsageList } from './SupportUsageList';

export const SupportUsageContainer = () => {
  useTitle(translate('Usage reports'));
  useReportingBreadcrumbs();
  return (
    <Panel>
      <SupportUsageFilter />
      <SupportUsageList />
    </Panel>
  );
};
