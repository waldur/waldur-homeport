import { FunctionComponent } from 'react';

import { Panel } from '@waldur/core/Panel';
import { translate } from '@waldur/i18n';
import { useReportingBreadcrumbs } from '@waldur/issues/workspace/SupportWorkspace';
import { useTitle } from '@waldur/navigation/title';

import { OrderItemsFilter } from './OrderItemsFilter';
import { SupportOrderItemsList } from './SupportOrderItemsList';

export const SupportOrderItemsContainer: FunctionComponent = () => {
  useTitle(translate('Orders'));
  useReportingBreadcrumbs();
  return (
    <Panel>
      <OrderItemsFilter
        showOrganizationFilter={true}
        showProviderFilter={true}
        showOfferingFilter={true}
        offeringFilter={{ shared: true }}
      />
      <SupportOrderItemsList />
    </Panel>
  );
};
