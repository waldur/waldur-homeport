import { FunctionComponent } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { formatDate } from '@waldur/core/dateUtils';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ProjectCostField } from '@waldur/project/ProjectCostField';
import { Table } from '@waldur/table';
import { connectTable } from '@waldur/table/utils';
import { getCustomer } from '@waldur/workspace/selectors';

import { fetchProviderProjects } from './api';

const ProviderProjectResourcesDialog = lazyComponent(
  () => import('./ProviderProjectResourcesDialog'),
  'ProviderProjectResourcesDialog',
);

const TableComponent: FunctionComponent<any> = (props) => {
  const dispatch = useDispatch();
  const customer = useSelector(getCustomer);
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => row.name,
        },
        {
          title: translate('Description'),
          render: ({ row }) => row.description || 'N/A',
        },
        {
          title: translate('End date'),
          render: ({ row }) =>
            row.project_end_date
              ? formatDate(row.end_date)
              : translate('No end date'),
        },
        {
          title: translate('Resources'),
          render: ({ row }) => (
            <button
              className="btn btn-link"
              onClick={() =>
                dispatch(
                  openModalDialog(ProviderProjectResourcesDialog, {
                    resolve: {
                      project_uuid: row.uuid,
                      provider_uuid: customer,
                    },
                    size: 'lg',
                  }),
                )
              }
            >
              {translate('{count} resources', {
                count: row.resources_count || 0,
              })}
            </button>
          ),
        },
        {
          title: translate('Estimated cost'),
          render: ProjectCostField,
        },
        {
          title: translate('Members'),
          render: ({ row }) =>
            translate('{count} members', { count: row.users_count || 0 }),
        },
      ]}
      verboseName={translate('projects')}
      hasActionBar={false}
    />
  );
};

const TableOptions = {
  table: 'OrganizationProjects',
  fetchData: fetchProviderProjects,
  mapPropsToTableId: ({ row }) => [row.uuid],
  mapPropsToFilter: ({ row, provider_uuid }) => ({
    customer_uuid: row.uuid,
    provider_uuid,
  }),
};

export const OrganizationProjectsExpandable =
  connectTable(TableOptions)(TableComponent);
