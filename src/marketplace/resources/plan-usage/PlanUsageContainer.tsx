import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';

import { PlanUsageFilter } from './PlanUsageFilter';
import { PlanUsageList } from './PlanUsageList';

export const PlanUsageContainer: FunctionComponent = () => {
  useTitle(translate('Plan capacity'));
  return <PlanUsageList filters={<PlanUsageFilter />} />;
};
