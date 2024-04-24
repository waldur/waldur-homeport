import { FunctionComponent, useMemo } from 'react';
import { Badge } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

const BadgesList = ({ items }) => (
  <>
    {items.map((c, index) => (
      <Badge key={index} className="me-3">
        {c.name}
      </Badge>
    ))}
  </>
);

export const RecipientsList: FunctionComponent<{ query }> = ({ query }) => {
  const filter = useMemo(
    () => ({
      all_users: query?.all_users,
      customers: query?.customers?.map((c) => c.uuid),
      offerings: query?.offerings?.map((c) => c.uuid),
    }),
    [query],
  );
  const props = useTable({
    table: 'broadcast-recipients',
    fetchData: createFetcher('broadcast-messages/recipients'),
    filter,
  });
  return (
    <Table
      {...props}
      hasActionBar={false}
      columns={[
        {
          title: translate('Recipient'),
          render: ({ row }) => <>{row.full_name}</>,
        },
        {
          title: translate('Email'),
          render: ({ row }) => <>{row.email}</>,
        },
        {
          title: translate('Offerings'),
          render: ({ row }) => <BadgesList items={row.offerings} />,
        },
        {
          title: translate('Organizations'),
          render: ({ row }) => <BadgesList items={row.customers} />,
        },
      ]}
      verboseName={translate('recepients')}
    />
  );
};
