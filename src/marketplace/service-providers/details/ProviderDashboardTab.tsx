import { Card } from 'react-bootstrap';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { OfferingCard } from '@waldur/marketplace/common/OfferingCard';
import { getLabel } from '@waldur/marketplace/common/registry';
import { OfferingStateField } from '@waldur/marketplace/offerings/OfferingStateField';
import { Offering } from '@waldur/marketplace/types';
import { PublicCallsList } from '@waldur/proposals/PublicCallsList';
import { Table } from '@waldur/table';
import { renderFieldOrDash, useTable } from '@waldur/table/utils';

export const ProviderOfferingsList = (props) => {
  const columns = [
    {
      title: translate('Name'),
      render: ({ row }: { row: Offering }) => (
        <Link
          state="public-offering.marketplace-public-offering"
          params={{ uuid: row.uuid }}
        >
          {row.name}
        </Link>
      ),
      orderField: 'name',
    },
    {
      title: translate('Organization'),
      render: ({ row }) => renderFieldOrDash(row.customer_name),
    },
    {
      title: translate('Type'),
      render: ({ row }) => <>{getLabel(row.type)}</>,
    },
    {
      title: translate('State'),
      render: ({ row }) => <OfferingStateField offering={row} />,
    },
  ];

  const tableProps = useTable({
    table: 'ProviderOfferingsList',
    fetchData: () =>
      Promise.resolve({
        rows: props.items,
        resultCount: props.items.length,
      }),
    queryField: 'keyword',
  });

  return (
    <Table
      {...tableProps}
      initialMode={props.initialMode}
      columns={columns}
      title={translate('Offerings')}
      gridSize={{ lg: 6, xl: 4 }}
      gridItem={({ row }) => <OfferingCard offering={row} />}
    />
  );
};

export const ProviderDashboardTab = (props) => {
  return (
    <div className="mb-10">
      <Card>
        <Card.Body>
          <ProviderOfferingsList
            items={props.data.offerings}
            initialMode="grid"
          />
        </Card.Body>
      </Card>
      <hr />
      <Card>
        <Card.Body>
          <PublicCallsList
            provider_uuid={props.data.provider.customer_uuid}
            offering_uuid={null}
            initialMode="grid"
          />
        </Card.Body>
      </Card>
    </div>
  );
};
