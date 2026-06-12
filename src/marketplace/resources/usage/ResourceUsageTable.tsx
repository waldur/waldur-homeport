import { FunctionComponent } from 'react';
import { OfferingComponent, Resource } from 'waldur-js-client';

import { translate } from '@/i18n';
import { TableWithTabs } from '@/table/TableWithTabs';

import { useResourceUsageTabs } from './utils';

interface ResourceUsageTableProps {
  offeringComponent: Pick<OfferingComponent, 'billing_type' | 'name'>;
  resource: Pick<Resource, 'name'>;
}

export const ResourceUsageTable: FunctionComponent<ResourceUsageTableProps> = ({
  offeringComponent,
  resource,
}) => {
  const tabs = useResourceUsageTabs();

  return (
    <TableWithTabs
      tabs={tabs}
      title={translate('Resource usage')}
      data={{
        offeringComponent,
        resource,
      }}
    />
  );
};
