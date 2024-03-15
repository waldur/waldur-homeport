import { translate } from '@waldur/i18n';
import { Table } from '@waldur/table';
import { ActionButton } from '@waldur/table/ActionButton';
import { useTable } from '@waldur/table/utils';

const dummyData = [
  {
    cidr: 'xx.xx.xx.xx/24',
    description: 'item 1',
  },
  {
    cidr: 'xx.xx.xx.xx/24',
    description: 'item 2',
  },
  {
    cidr: 'xx.xx.xx.xx/24',
    description: 'item 3',
  },
];

export const CustomerAccessControlPanel = () => {
  const tableProps = useTable({
    table: 'customerAccessControl',
    fetchData: () =>
      Promise.resolve({
        rows: dummyData,
        resultCount: dummyData.length,
      }),
    queryField: 'description',
  });

  return (
    <Table
      {...tableProps}
      id="access-control"
      className="mt-5"
      title={translate('Access control')}
      columns={[
        {
          title: translate('CIDR'),
          render: ({ row }) => <>{row.cidr}</>,
        },
        {
          title: translate('Description'),
          render: ({ row }) => <>{row.description}</>,
        },
      ]}
      verboseName={translate('Access control')}
      hasQuery
      actions={
        <ActionButton
          action={null}
          title={translate('New access subnet')}
          icon="fa fa-plus"
          variant="light"
        />
      }
    />
  );
};
