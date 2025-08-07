import { ExternalLink } from 'waldur-js-client';

import Avatar from '@waldur/core/Avatar';
import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { Column } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';

import { QuickShortcutCreateButton } from './QuickShortcutCreateButton';
import { QuickShortcutsRowActions } from './QuickShortcutsRowActions';

export const QuickShortcutsList = () => {
  const tableProps = useTable({
    table: 'QuickShortcutsList',
    fetchData: createFetcher('external-links'),
    queryField: 'query',
  });
  const columns: Column<ExternalLink>[] = [
    {
      title: translate('Name'),
      render: ({ row }) => (
        <div className="d-flex align-items-center">
          <div className="me-2">
            <Avatar name={row.name} src={row.image} circle size={32} />
          </div>
          <span>{row.name}</span>
        </div>
      ),
    },
    {
      title: translate('Description'),
      render: ({ row }) => row.description,
    },
    {
      title: translate('Link'),
      render: ({ row }) => (
        <a href={row.link} target="_blank" rel="noopener noreferrer">
          {row.link}
        </a>
      ),
    },
  ];

  return (
    <Table<ExternalLink>
      {...tableProps}
      columns={columns}
      hasQuery
      tableActions={<QuickShortcutCreateButton refetch={tableProps.fetch} />}
      rowActions={({ row }) => (
        <QuickShortcutsRowActions refetch={tableProps.fetch} row={row} />
      )}
    />
  );
};
