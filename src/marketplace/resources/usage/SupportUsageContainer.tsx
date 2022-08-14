import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { useReportingTabs } from '@waldur/issues/workspace/SupportWorkspace';
import { useTitle } from '@waldur/navigation/title';

import { SupportUsageFilter } from './SupportUsageFilter';
import { SupportUsageList } from './SupportUsageList';

export const SupportUsageContainer: FunctionComponent = () => {
  useTitle(translate('Usage reports'));
  useReportingTabs();
  return <SupportUsageList filters={<SupportUsageFilter />} />;
};
