import { FunctionComponent } from 'react';
import { Form } from 'react-final-form';
import { RancherIngress, rancherIngressesList } from 'waldur-js-client';

import { formatDate } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import {
  RancherClusterFilter,
  RancherClusterFilterFormId,
} from '@/table/generated/RancherClusterFilter';
import Table from '@/table/Table';
import { TableWithPortal } from '@/table/types';
import { useTable } from '@/table/useTable';

import { useClusterResourceFilter } from './ClusterFilterHooks';
import { ImportYAMLButton } from './ImportYAMLButton';
import { IngressActions } from './IngressActions';

const ClusterIngressesListTable: FunctionComponent<
  TableWithPortal<{ resourceScope }>
> = ({ resourceScope, portal }) => {
  const { filter } = useClusterResourceFilter(resourceScope);

  const props = useTable({
    table: 'rancher-ingresses',
    fetchData: createFetcher(rancherIngressesList),
    filter,
  });

  return (
    <Table<RancherIngress>
      {...props}
      formId={RancherClusterFilterFormId}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => <>{row.name}</>,
          copyField: (row) => row.name,
        },
        {
          title: translate('Project'),
          render: ({ row }) => <>{row.rancher_project_name}</>,
          filter: 'rancher_project',
        },
        {
          title: translate('Namespace'),
          render: ({ row }) => <>{row.namespace_name}</>,
          filter: 'namespace',
        },
        {
          title: translate('Targets'),
          render: ({ row }) => (
            <>
              {
                // @ts-ignore
                row.rules.map((rule) => rule.host).join(', ')
              }
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
      ]}
      rowActions={IngressActions}
      verboseName={translate('ingresses')}
      filters={<RancherClusterFilter cluster={resourceScope} />}
      showPageSizeSelector
      tableActions={<ImportYAMLButton cluster_id={resourceScope.uuid} />}
      portal={portal}
      hasActionBar={false}
      cardBordered={false}
      fullWidth
    />
  );
};

export const ClusterIngressesList: FunctionComponent<
  TableWithPortal<{ resourceScope }>
> = (props) => (
  <Form
    id={RancherClusterFilterFormId}
    onSubmit={() => {}}
    subscription={{ values: true }}
  >
    {() => <ClusterIngressesListTable {...props} />}
  </Form>
);
