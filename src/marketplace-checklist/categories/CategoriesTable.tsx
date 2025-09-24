import { FC } from 'react';
import {
  ChecklistCategory,
  checklistsAdminCategoriesList,
} from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { TableWithPortal } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';

import { ChecklistsTableActions } from '../ChecklistsTableActions';

import { CategoryRowActions } from './CategoryRowActions';

export const CategoriesTable: FC<TableWithPortal> = ({ portal }) => {
  const tableProps = useTable({
    table: 'CategoriesTable',
    fetchData: createFetcher(checklistsAdminCategoriesList),
    queryField: 'name',
  });

  return (
    <Table<ChecklistCategory>
      {...tableProps}
      columns={[
        {
          title: translate('Category name'),
          render: ({ row }) => row.name,
        },
        {
          title: translate('Description'),
          render: ({ row }) => row.description,
        },
        {
          title: translate('Chacklists'),
          render: ({ row }) => row.checklists_count,
        },
      ]}
      showPageSizeSelector
      verboseName={translate('Categories')}
      portal={portal}
      hasActionBar={false}
      cardBordered={false}
      fullWidth
      hasQuery
      tableActions={<ChecklistsTableActions refetch={tableProps.fetch} />}
      rowActions={CategoryRowActions}
    />
  );
};
