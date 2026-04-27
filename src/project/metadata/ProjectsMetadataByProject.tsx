import { FC } from 'react';
import { useSelector } from 'react-redux';
import { customersProjectMetadataComplianceDetailsList } from 'waldur-js-client';

import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { TableWithPortal } from '@/table/types';
import { useTable } from '@/table/useTable';
import { getCustomer } from '@/workspace/selectors';

import { ProjectsTableActions } from '../ProjectsTableActions';

import { MetadataByProjectExpandableRow } from './MetadataByProjectExpandableRow';

export const ProjectsMetadataByProject: FC<TableWithPortal> = ({ portal }) => {
  const currentCustomer = useSelector(getCustomer);

  const tableProps = useTable({
    table: 'ProjectsMetadataByProject-' + currentCustomer.uuid,
    fetchData: createFetcher(customersProjectMetadataComplianceDetailsList, {
      parser: (data) => data.project_details,
      path: { customer_uuid: currentCustomer.uuid },
    }),
    queryField: 'query',
  });

  if (!currentCustomer.project_metadata_checklist) return null;

  return (
    <Table
      {...tableProps}
      columns={[
        {
          title: translate('Project name'),
          render: ({ row }) => row.project_name,
          orderField: 'name',
        },
      ]}
      verboseName={translate('Projects')}
      portal={portal}
      hasActionBar={false}
      cardBordered={false}
      fullWidth
      hasQuery
      tableActions={<ProjectsTableActions customer={currentCustomer} />}
      expandableRow={MetadataByProjectExpandableRow}
    />
  );
};
