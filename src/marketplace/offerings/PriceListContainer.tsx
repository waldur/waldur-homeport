import { FunctionComponent } from 'react';

import { Panel } from '@waldur/core/Panel';
import { translate } from '@waldur/i18n';
import { useReportingBreadcrumbs } from '@waldur/issues/workspace/SupportWorkspace';
import { useTitle } from '@waldur/navigation/title';

import { PriceList } from './PriceList';

export const PriceListContainer: FunctionComponent = () => {
  useTitle(translate('Pricelist'));
  useReportingBreadcrumbs();
  return (
    <Panel>
      <PriceList />
    </Panel>
  );
};
