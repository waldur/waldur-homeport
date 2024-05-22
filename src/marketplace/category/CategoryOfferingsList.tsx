import { FunctionComponent, useMemo } from 'react';

import { translate } from '@waldur/i18n';
import { getLabel } from '@waldur/marketplace/common/registry';
import { Table, createFetcher } from '@waldur/table';
import { renderFieldOrDash, useTable } from '@waldur/table/utils';

import { OfferingCard } from '../common/OfferingCard';
import { OfferingNameColumn } from '../offerings/list/OfferingNameColumn';

export const CategoryOfferingsList: FunctionComponent<{
  category;
}> = ({ category }) => {
  const filter = useMemo(() => ({ category_uuid: category.uuid }), [category]);
  const props = useTable({
    table: 'CategoryOfferingsList',
    filter,
    fetchData: createFetcher('marketplace-public-offerings'),
    queryField: 'keyword',
  });

  const columns = [
    {
      title: translate('Name'),
      render: OfferingNameColumn,
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
  ];

  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('offerings')}
      hasQuery={true}
      mode="grid"
      gridSize={{ lg: 6, xl: 4 }}
      gridItem={({ row }) => <OfferingCard offering={row} />}
    />
  );
};
