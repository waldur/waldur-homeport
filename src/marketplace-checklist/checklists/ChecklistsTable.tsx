import { FC } from 'react';
import { Checklist, checklistsAdminList } from 'waldur-js-client';

import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { TableWithPortal } from '@/table/types';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { ChecklistsTableActions } from '../ChecklistsTableActions';
import { CHECKLIST_TABLE_ID } from '../constants';
import { checklistTypeOptions } from '../utils';

import { ChecklistExpandableRow } from './ChecklistExpandableRow';
import { ChecklistRowActions } from './ChecklistRowActions';
import { ChecklistsBulkRemoveButton } from './ChecklistsBulkRemoveButton';

export const ChecklistsTable: FC<TableWithPortal> = ({ portal }) => {
  const tableProps = useTable({
    table: CHECKLIST_TABLE_ID,
    fetchData: createFetcher(checklistsAdminList),
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
          title: translate('Checklist type'),
          render: ({ row }) => {
            const option = checklistTypeOptions.find(
              (opt) => opt.value === row.checklist_type,
            );
            return renderFieldOrDash(option?.label);
          },
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
      enableMultiSelect
      multiSelectActions={ChecklistsBulkRemoveButton}
    />
  );
};
