import { FC } from 'react';
import { broadcastMessageTemplatesList } from 'waldur-js-client';

import { BroadcastTemplateActions } from '@/broadcasts/BroadcastTemplateActions';
import { BroadcastTemplateCreateButton } from '@/broadcasts/BroadcastTemplateCreateButton';
import { BroadcastTemplateExpandableRow } from '@/broadcasts/BroadcastTemplateExpandableRow';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

interface BroadcastTemplateListProps {
  standalone?: boolean;
}

export const BroadcastTemplateList: FC<BroadcastTemplateListProps> = ({
  standalone = false,
}) => {
  const tableProps = useTable({
    table: 'broadcast-templates',
    fetchData: createFetcher(broadcastMessageTemplatesList),
  });
  return (
    <Table
      {...tableProps}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => row.name,
          copyField: (row) => row.name,
        },
        {
          title: translate('Subject'),
          render: ({ row }) => row.subject,
        },
      ]}
      verboseName={translate('broadcast templates')}
      tableActions={
        <BroadcastTemplateCreateButton refetch={tableProps.fetch} />
      }
      expandableRow={BroadcastTemplateExpandableRow}
      initialPageSize={10}
      showPageSizeSelector={true}
      rowActions={({ row }) => (
        <BroadcastTemplateActions row={row} refetch={tableProps.fetch} />
      )}
      hasQuery={true}
      standalone={standalone}
    />
  );
};
