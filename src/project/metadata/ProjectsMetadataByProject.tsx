import { FC } from 'react';
import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { TableWithPortal } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';
import { getCustomer } from '@waldur/workspace/selectors';

import { ProjectsTableActions } from '../ProjectsTableActions';

import { MetadataByProjectExpandableRow } from './MetadataByProjectExpandableRow';

export const ProjectsMetadataByProject: FC<TableWithPortal> = ({ portal }) => {
  const currentCustomer = useSelector(getCustomer);

  const tableProps = useTable({
    table: 'ProjectsMetadataByProject-' + currentCustomer.uuid,
    fetchData: createFetcher(
      `customers/${currentCustomer.uuid}/project-metadata-compliance-details`,
      { parser: (data) => data.project_details },
    ),
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
