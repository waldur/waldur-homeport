import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { GrowthChart } from '@waldur/invoices/growth/GrowthChart';
import { GrowthFilter } from '@waldur/invoices/growth/GrowthFilter';
import { useTitle } from '@waldur/navigation/title';

export const GrowthContainer: FunctionComponent = () => {
  useTitle(translate('Growth'));
  return (
    <>
      <GrowthFilter />
      <GrowthChart />
    </>
  );
};
