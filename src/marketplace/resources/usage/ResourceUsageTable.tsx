import { FunctionComponent } from 'react';
import { OfferingComponent, Resource } from 'waldur-js-client';

import { translate } from '@/i18n';
import { TableWithTabs } from '@/table/TableWithTabs';

import { useResourceUsageTabs } from './utils';

interface ResourceUsageTableProps {
  offeringComponent: Pick<
    OfferingComponent,
    'billing_type' | 'name' | 'type' | 'measured_unit' | 'factor'
  >;
  resource: Pick<Resource, 'name'>;
  offeringType?: string;
}

export const ResourceUsageTable: FunctionComponent<ResourceUsageTableProps> = ({
  offeringComponent,
  resource,
  offeringType,
}) => {
  const tabs = useResourceUsageTabs();

  return (
    <TableWithTabs
      tabs={tabs}
      title={translate('Resource usage')}
      data={{
        offeringComponent,
        resource,
        offeringType,
      }}
    />
  );
};
