import { FC } from 'react';
import { useSelector } from 'react-redux';
import { customersProjectMetadataQuestionAnswersList } from 'waldur-js-client';

import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { TableWithPortal } from '@/table/types';
import { useTable } from '@/table/useTable';
import { getCustomer } from '@/workspace/selectors';

import { ProjectsTableActions } from '../ProjectsTableActions';

import { MetadataByAnswerExpandableRow } from './MetadataByAnswerExpandableRow';

export const ProjectsMetadataByAnswer: FC<TableWithPortal> = ({ portal }) => {
  const currentCustomer = useSelector(getCustomer);
  const checklistUuid = currentCustomer.project_metadata_checklist;

  const tableProps = useTable({
    table: 'ProjectsMetadata-' + currentCustomer.uuid,
    fetchData: createFetcher(customersProjectMetadataQuestionAnswersList, {
      path: { customer_uuid: currentCustomer.uuid },
    }),
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
