import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { AddResourceButton } from '@waldur/marketplace/resources/actions/AddResourceButton';
import { ActionButtonResource } from '@waldur/resource/actions/ActionButtonResource';
import { IPList } from '@waldur/resource/IPList';
import { ResourceName } from '@waldur/resource/ResourceName';
import { ResourceState } from '@waldur/resource/state/ResourceState';
import { ResourceSummary } from '@waldur/resource/summary/ResourceSummary';
import { ResourceSummaryField } from '@waldur/resource/summary/VirtualMachineSummary';
import { Table, connectTable, createFetcher } from '@waldur/table';

const TableComponent: FunctionComponent<any> = (props) => {
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => <ResourceName resource={row} />,
        },
        {
          title: translate('Summary'),
          render: ({ row }) => <ResourceSummaryField resource={row} />,
        },
        {
          title: translate('Internal IPs'),
          render: ({ row }) => <IPList value={row.internal_ips} />,
        },
        {
          title: translate('External IPs'),
          render: ({ row }) => <IPList value={row.external_ips} />,
        },
        {
          title: translate('State'),
          render: ({ row }) => <ResourceState resource={row} />,
        },
      ]}
      verboseName={translate('instances')}
      actions={<AddResourceButton resource={props.resource} />}
      hoverableRow={({ row }) => <ActionButtonResource url={row.url} />}
      expandableRow={({ row }) => <ResourceSummary resource={row} />}
      hasQuery={true}
    />
  );
};

const TableOptions = {
  table: 'openstacktenant-instances',
  fetchData: createFetcher('openstacktenant-instances'),
  mapPropsToFilter: (props) => ({
    service_settings_uuid: props.resource.child_settings,
  }),
  queryField: 'name',
};

export const TenantInstancesList = connectTable(TableOptions)(TableComponent);
