import * as React from 'react';

import { formatDate } from '@waldur/core/dateUtils';
import { Table, connectTable, createFetcher } from '@waldur/table';
import { TableOptionsType } from '@waldur/table/types';

import { ImportYAMLButton } from './ImportYAMLButton';
import { ServiceActions } from './ServiceActions';

const TableComponent = (props) => {
  const { translate } = props;
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => <>{row.name}</>,
        },
        {
          title: translate('Namespace'),
          render: ({ row }) => <>{row.namespace_name}</>,
        },
        {
          title: translate('Cluster IP'),
          render: ({ row }) => <>{row.cluster_ip || 'N/A'}</>,
        },
        {
          title: translate('Target'),
          render: ({ row }) => (
            <>
              {row.target_workloads
                .map((workload) => workload.name)
                .join(', ') || 'N/A'}
            </>
          ),
        },
        {
          title: translate('Selector'),
          render: ({ row }) => (
            <>
              {row.selector
                ? Object.entries(row.selector)
                    .map(([key, value]) => `${key}=${value}`)
                    .join(', ')
                : 'N/A'}
            </>
          ),
        },
        {
          title: translate('Created'),
          render: ({ row }) => <>{formatDate(row.created)}</>,
        },
        {
          title: translate('State'),
          render: ({ row }) => <>{row.runtime_state}</>,
        },
        {
          title: translate('Actions'),
          render: ({ row }) => <ServiceActions service={row} />,
        },
      ]}
      verboseName={translate('services')}
      actions={<ImportYAMLButton cluster_id={props.resource.uuid} />}
    />
  );
};

const TableOptions: TableOptionsType = {
  table: 'rancher-services',
  fetchData: createFetcher('rancher-services'),
  mapPropsToFilter: (props) => ({
    cluster_uuid: props.resource.uuid,
  }),
};

export const ClusterServicesList = connectTable(TableOptions)(TableComponent);
