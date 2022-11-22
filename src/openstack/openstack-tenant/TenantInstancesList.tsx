import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { ActionButtonResource } from '@waldur/resource/actions/ActionButtonResource';
import { ResourceName } from '@waldur/resource/ResourceName';
import { ResourceState } from '@waldur/resource/state/ResourceState';
import { ResourceSummary } from '@waldur/resource/summary/ResourceSummary';
import {
  formatIpList,
  ResourceSummaryField,
} from '@waldur/resource/summary/VirtualMachineSummary';
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
          title: translate('State'),
          render: ({ row }) => <ResourceState resource={row} />,
        },
        {
          title: translate('Internal IPs'),
          render: ({ row }) => formatIpList(row.internal_ips),
        },
        {
          title: translate('External IPs'),
          render: ({ row }) => formatIpList(row.external_ips),
        },
        {
          title: translate('Summary'),
          render: ({ row }) => <ResourceSummaryField resource={row} />,
        },
      ]}
      verboseName={translate('instances')}
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
