import { FunctionComponent } from 'react';

import { Panel } from '@waldur/core/Panel';
import { translate } from '@waldur/i18n';
import { useReportingBreadcrumbs } from '@waldur/issues/workspace/SupportWorkspace';
import { SupportOrdersList } from '@waldur/marketplace/orders/item/list/SupportOrdersList';
import { SupportOrdersListFilter } from '@waldur/marketplace/orders/item/list/SupportOrdersListFilter';
import { useTitle } from '@waldur/navigation/title';

export const SupportOrdersContainer: FunctionComponent = () => {
  useTitle(translate('Orders'));
  useReportingBreadcrumbs();
  return (
    <Panel>
      <SupportOrdersListFilter />
      <SupportOrdersList />
    </Panel>
  );
};
