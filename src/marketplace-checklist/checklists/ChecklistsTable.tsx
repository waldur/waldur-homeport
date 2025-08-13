import { FC } from 'react';
import { Checklist } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { TableWithPortal } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';
import { renderFieldOrDash } from '@waldur/table/utils';

import { ChecklistsTableActions } from '../ChecklistsTableActions';
import { CHECKLIST_TABLE_ID } from '../constants';

import { ChecklistExpandableRow } from './ChecklistExpandableRow';
import { ChecklistRowActions } from './ChecklistRowActions';

export const ChecklistsTable: FC<TableWithPortal> = ({ portal }) => {
  const tableProps = useTable({
    table: CHECKLIST_TABLE_ID,
    fetchData: createFetcher('checklists-admin'),
    queryField: 'name',
  });

  return (
    <Table<Checklist>
      {...tableProps}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => row.name,
        },
        {
          title: translate('Category'),
          render: ({ row }) => renderFieldOrDash(row.category_name),
        },
        {
          title: translate('Questions'),
          render: ({ row }) => row.questions_count ?? '0',
        },
      ]}
      showPageSizeSelector
      verboseName={translate('Checklists')}
      portal={portal}
      hasActionBar={false}
      cardBordered={false}
      fullWidth
      hasQuery
      tableActions={<ChecklistsTableActions refetch={tableProps.fetch} />}
      rowActions={ChecklistRowActions}
      expandableRow={ChecklistExpandableRow}
    />
  );
};
