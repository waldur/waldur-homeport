import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { getLabel } from '@waldur/marketplace/common/registry';
import { Table, createFetcher } from '@waldur/table';
import { SLUG_COLUMN } from '@waldur/table/slug';
import { renderFieldOrDash, useTable } from '@waldur/table/utils';
import { getUser } from '@waldur/workspace/selectors';

import { OfferingCard } from '../common/OfferingCard';
import { OfferingLink } from '../links/OfferingLink';
import { AdminOfferingsFilter } from '../offerings/admin/AdminOfferingsFilter';
import { mapStateToFilter } from '../offerings/admin/AdminOfferingsList';
import { OfferingStateField } from '../offerings/OfferingStateField';
import { isOfferingRestrictedToProject } from '../offerings/utils';
import { Offering } from '../types';

const RowActions = ({ row }) => {
  const user = useSelector(getUser);
  const { isAllowed } = isOfferingRestrictedToProject(row, user);

  return (
    <OfferingLink
      offering_uuid={row.uuid}
      className="btn btn-outline btn-outline-dark btn-sm border-gray-400 btn-active-secondary px-2"
      disabled={!isAllowed}
    >
      {translate('Deploy')}
    </OfferingLink>
  );
};

export const PublicOfferingsList: FunctionComponent<{
  filter?;
  showCategory?;
  showOrganization?;
  initialMode?;
}> = ({ filter, showCategory, showOrganization = true, initialMode }) => {
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
      id: 'name',
      keys: ['name'],
    },
    {
      title: translate('Organization'),
      render: ({ row }) => renderFieldOrDash(row.customer_name),
      filter: showOrganization ? 'organization' : undefined,
      id: 'organization',
      keys: ['customer_name'],
    },
    {
      title: translate('Type'),
      render: ({ row }) => <>{getLabel(row.type)}</>,
      filter: 'offering_type',
      id: 'offering_type',
      keys: ['type'],
    },
    {
      title: translate('State'),
      render: ({ row }) => <OfferingStateField offering={row} />,
      filter: 'state',
      id: 'state',
      keys: ['state'],
    },
    SLUG_COLUMN,
  ];

  if (showCategory) {
    columns.push({
      title: translate('Category'),
      render: ({ row }) => row.category_title,
      filter: 'category',
      id: 'category',
      keys: ['category_title'],
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
      filters={
        <AdminOfferingsFilter
          showCategory={showCategory}
          showOrganization={showOrganization}
        />
      }
      initialMode={initialMode === 'table' ? 'table' : 'grid'}
      standalone
      title={translate('Offerings')}
      hoverableRow={RowActions}
      hasOptionalColumns
    />
  );
};
