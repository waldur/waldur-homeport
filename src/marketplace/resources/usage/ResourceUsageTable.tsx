import { FunctionComponent } from 'react';
import { OfferingComponent, Resource } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { TableWithTabs } from '@waldur/table/TableWithTabs';

import { useResourceUsageTabs } from './utils';

interface ResourceUsageTableProps {
  offeringComponent: OfferingComponent;
  resource: Resource;
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
