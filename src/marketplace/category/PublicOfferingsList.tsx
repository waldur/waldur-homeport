import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  MarketplacePublicOfferingsListData,
  PublicOfferingDetails,
} from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import {
  getLabel,
  getOfferingTypes,
} from '@waldur/marketplace/common/registry';
import { createFetcher } from '@waldur/table/api';
import { BooleanField } from '@waldur/table/BooleanField';
import { SLUG_COLUMN } from '@waldur/table/slug';
import Table from '@waldur/table/Table';
import { Column } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';
import { renderFieldOrDash } from '@waldur/table/utils';
import { getUser } from '@waldur/workspace/selectors';

import { OfferingCard } from '../common/OfferingCard';
import { OfferingLink } from '../links/OfferingLink';
import { AdminOfferingsFilter } from '../offerings/admin/AdminOfferingsFilter';
import { mapStateToFilter } from '../offerings/admin/AdminOfferingsList';
import { getStates } from '../offerings/list/OfferingStateFilter';
import { OfferingStateField } from '../offerings/OfferingStateField';
import { isOfferingRestrictedToProject } from '../offerings/utils';
import { Offering } from '../types';

const RowActions = ({ row }) => {
  const user = useSelector(getUser);
  const { isAllowed } = isOfferingRestrictedToProject(row, user);
  if (isFeatureVisible(MarketplaceFeatures.catalogue_only)) {
    return null;
  }

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

const mandatoryFields: MarketplacePublicOfferingsListData['query']['field'] = [
  // OfferingCard
  'uuid',
  'name',
  'state',
  'paused_reason',
  'customer_name',
  'project_name',
  'thumbnail',
  'image',
  'type',
  // OfferingCard and RowActions
  'customer_uuid',
  'shared',
  'project_uuid',
];

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
    mandatoryFields,
  });

  const columns: Column<PublicOfferingDetails>[] = [
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

      copyField: (row) => row.name,
      orderField: 'name',
      id: 'name',
      keys: ['name'],
    },
    {
      title: translate('Organization'),
      render: ({ row }) => renderFieldOrDash(row.customer_name),
      filter: showOrganization ? 'organization' : undefined,
      inlineFilter: showOrganization
        ? (row) => ({ name: row.customer_name, uuid: row.customer_uuid })
        : undefined,
      id: 'organization',
      keys: ['customer_name'],
    },
    {
      title: translate('Type'),
      render: ({ row }) => <>{getLabel(row.type)}</>,
      filter: 'offering_type',
      inlineFilter: (row) =>
        getOfferingTypes().find((op) => op.value === row.type),
      id: 'offering_type',
      keys: ['type'],
    },
    {
      title: translate('State'),
      render: ({ row }) => <OfferingStateField offering={row} />,
      filter: 'state',
      inlineFilter: (row) => getStates().filter((op) => op.value === row.state),
      id: 'state',
      keys: ['state'],
    },
    {
      title: translate('Shared'),
      render: ({ row }) => <BooleanField value={row.shared} />,
      id: 'shared',
      filter: 'shared',
      keys: ['shared'],
      optional: true,
    },
    SLUG_COLUMN as Column<PublicOfferingDetails>,
  ];

  if (showCategory) {
    columns.push({
      title: translate('Category'),
      render: ({ row }) => row.category_title,
      filter: 'category',
      inlineFilter: (row) => ({
        uuid: row.category_uuid,
        title: row.category_title,
      }),
      id: 'category',
      keys: ['category_title', 'category_uuid'],
    });
  }

  columns.push({
    title: translate('Created at'),
    render: ({ row }) => formatDateTime(row.created),
    orderField: 'created',
    id: 'created',
    keys: ['created'],
  });

  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('offerings')}
      hasQuery={true}
      gridSize={{ lg: 6, xl: 4 }}
      gridItem={({ row }) => <OfferingCard offering={row} />}
      hoverShadow={{ grid: false }}
      filters={
        <AdminOfferingsFilter
          showCategory={showCategory}
          showOrganization={showOrganization}
        />
      }
      initialSorting={{ field: 'created', mode: 'desc' }}
      initialMode={initialMode === 'table' ? 'table' : 'grid'}
      standalone
      title={translate('Offerings')}
      rowActions={RowActions}
      hasOptionalColumns
    />
  );
};
