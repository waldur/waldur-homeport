import { BroadcastTemplateActions } from '@waldur/broadcasts/BroadcastTemplateActions';
import { BroadcastTemplateCreateButton } from '@waldur/broadcasts/BroadcastTemplateCreateButton';
import { BroadcastTemplateExpandableRow } from '@waldur/broadcasts/BroadcastTemplateExpandableRow';
import { translate } from '@waldur/i18n';
import { createFetcher, Table } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

export const BroadcastTemplateList = () => {
  const tableProps = useTable({
    table: 'broadcast-templates',
    fetchData: createFetcher('broadcast-message-templates'),
  });
  return (
    <Table
      {...tableProps}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => row.name,
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
      expandableRowClassName="bg-gray-200"
      rowActions={({ row }) => (
        <BroadcastTemplateActions row={row} refetch={tableProps.fetch} />
      )}
      hasQuery={true}
      standalone
    />
  );
};
