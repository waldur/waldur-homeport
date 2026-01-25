import { FC } from 'react';

import { translate } from '@waldur/i18n';
import { PriceList } from '@waldur/marketplace/offerings/PriceList';
import { useTitle } from '@waldur/navigation/title';

import { useReportBreadcrumbs } from '../ReportsBreadcrumbs';

export const PricelistPage: FC = () => {
  useTitle(translate('Pricelist'));
  useReportBreadcrumbs({ category: 'financial', currentReport: 'pricelist' });

  return <PriceList />;
};
