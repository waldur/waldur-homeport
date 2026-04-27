import { ExternalLink, externalLinksList } from 'waldur-js-client';

import Avatar from '@/core/Avatar';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';

import { QuickShortcutCreateButton } from './QuickShortcutCreateButton';
import { QuickShortcutsRowActions } from './QuickShortcutsRowActions';

export const QuickShortcutsList = () => {
  const tableProps = useTable({
    table: 'QuickShortcutsList',
    fetchData: createFetcher(externalLinksList),
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
