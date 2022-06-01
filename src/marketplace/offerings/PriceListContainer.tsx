import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { useReportingBreadcrumbs } from '@waldur/issues/workspace/SupportWorkspace';
import { useTitle } from '@waldur/navigation/title';

import { PriceList } from './PriceList';

export const PriceListContainer: FunctionComponent = () => {
  useTitle(translate('Pricelist'));
  useReportingBreadcrumbs();
  return <PriceList />;
};
