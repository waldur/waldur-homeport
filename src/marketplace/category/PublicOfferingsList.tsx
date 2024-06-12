import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { getLabel } from '@waldur/marketplace/common/registry';
import { Table, createFetcher } from '@waldur/table';
import { renderFieldOrDash, useTable } from '@waldur/table/utils';

import { OfferingCard } from '../common/OfferingCard';
import { AdminOfferingsFilter } from '../offerings/admin/AdminOfferingsFilter';
import { mapStateToFilter } from '../offerings/admin/AdminOfferingsList';
import { OfferingStateField } from '../offerings/OfferingStateField';
import { Offering } from '../types';

export const PublicOfferingsList: FunctionComponent<{
  filter?;
  showCategory?;
  initialMode?;
}> = ({ filter, showCategory, initialMode }) => {
  const baseFilter = useSelector(mapStateToFilter);

  const mergedFilter = useMemo(
    () => ({ ...baseFilter, ...filter }),
    [baseFilter, filter],
  );

  const props = useTable({
    table: 'PublicOfferingsList',
    filter: mergedFilter,
    fetchData: createFetcher('marketplace-public-offerings'),
    queryField: 'keyword',
  });

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

  if (showCategory) {
    columns.push({
      title: translate('Category'),
      render: ({ row }) => row.category_title,
    });
  }

  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('offerings')}
      hasQuery={true}
      gridSize={{ lg: 6, xl: 4 }}
      gridItem={({ row }) => <OfferingCard offering={row} />}
      filters={<AdminOfferingsFilter showCategory={showCategory} />}
      initialMode={initialMode === 'table' ? 'table' : 'grid'}
    />
  );
};
