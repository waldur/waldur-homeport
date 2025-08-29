import { FC } from 'react';
import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { TableWithPortal } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';
import { getCustomer } from '@waldur/workspace/selectors';

import { ProjectsTableActions } from '../ProjectsTableActions';

import { MetadataByAnswerExpandableRow } from './MetadataByAnswerExpandableRow';

export const ProjectsMetadataByAnswer: FC<TableWithPortal> = ({ portal }) => {
  const currentCustomer = useSelector(getCustomer);
  const checklistUuid = currentCustomer.project_metadata_checklist;

  const tableProps = useTable({
    table: 'ProjectsMetadata-' + currentCustomer.uuid,
    fetchData: createFetcher(
      `customers/${currentCustomer.uuid}/project-metadata-question-answers`,
    ),
  });

  if (!checklistUuid) return null;

  return (
    <Table
      {...tableProps}
      columns={[
        {
          title: translate('Question'),
          render: ({ row }) => row.question_description,
        },
      ]}
      verboseName={translate('Questions')}
      portal={portal}
      hasActionBar={false}
      cardBordered={false}
      fullWidth
      hasQuery
      tableActions={<ProjectsTableActions customer={currentCustomer} />}
      expandableRow={MetadataByAnswerExpandableRow}
    />
  );
};
