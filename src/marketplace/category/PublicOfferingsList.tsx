import { DotsThreeVerticalIcon } from '@phosphor-icons/react';
import { useRouter } from '@uirouter/react';
import { FunctionComponent, useMemo } from 'react';
import { Dropdown } from 'react-bootstrap';
import {
  marketplacePublicOfferingsList,
  MarketplacePublicOfferingsListData,
  NestedTag,
  PublicOfferingDetails,
} from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { Link } from '@/core/Link';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { getLabel, getOfferingTypes } from '@/marketplace/common/registry';
import { createFetcher } from '@/table/api';
import { BooleanField } from '@/table/BooleanField';
import { SLUG_COLUMN } from '@/table/slug';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useFilterValues } from '@/table/useFilterValues';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';
import { useUser } from '@/workspace/hooks';

import { CardStyleType } from '../common/cards/index';
import { OfferingCard } from '../common/OfferingCard';
import { useCardStyle } from '../landing/CardStyleContext';
import { getOfferingGridSize } from '../landing/utils';
import { buildOfferingsFilter } from '../offerings/admin/AdminOfferingsList';
import { OFFERINGS_FILTER_FORM_ID } from '../offerings/constants';
import { OfferingsListFilter } from '../offerings/list/OfferingsListFilter';
import { getStates } from '../offerings/list/OfferingStateFilter';
import { OfferingStateField } from '../offerings/OfferingStateField';
import { isOfferingRestrictedToProject } from '../offerings/utils';

const RowActions = ({ row }) => {
  const user = useUser();
  const router = useRouter();
  const { isAllowed } = isOfferingRestrictedToProject(row, user);
  // An offering the user cannot order (restricted role or no accessible plan)
  // is reported by the backend as is_accessible === false; keep its Deploy
  // action disabled so it matches the offering detail page.
  const isInaccessible = Boolean(user) && row.is_accessible === false;
  const canDeploy = isAllowed && !isInaccessible;
  if (isFeatureVisible(MarketplaceFeatures.catalogue_only)) {
    return null;
  }

  return (
    <Dropdown drop="down" align="start">
      <Dropdown.Toggle
        variant="text-secondary"
        className="btn-icon no-arrow"
        disabled={!canDeploy}
        size="sm"
      >
        <DotsThreeVerticalIcon size={22} weight="bold" />
      </Dropdown.Toggle>
      <Dropdown.Menu flip={false}>
        <Dropdown.Item
          onClick={() => {
            if (canDeploy) {
              setTimeout(() => {
                router.stateService.go('marketplace-offering-public', {
                  offering_uuid: row.uuid,
                });
              }, 100);
            }
          }}
          disabled={!canDeploy}
        >
          {translate('Deploy')}
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

const mandatoryFields: MarketplacePublicOfferingsListData['query']['field'] = [
  // OfferingCard
  'uuid',
  'name',
  'description',
  'state',
  'paused_reason',
  'customer_name',
  'project_name',
  'thumbnail',
  'image',
  'type',
  'tags',
  'is_accessible',
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
  variant?: CardStyleType;
  onTagClick?(tag: NestedTag): void;
}> = ({
  filter,
  showCategory,
  showOrganization = true,
  initialMode,
  variant,
  onTagClick,
}) => {
  const contextCardStyle = useCardStyle();
  const resolvedVariant = variant ?? contextCardStyle;

  const values = useFilterValues('PublicOfferingsList');
  const filterValues: any = values;

  const baseFilter = useMemo(
    () => buildOfferingsFilter(filterValues),
    [filterValues],
  );

  const mergedFilter = useMemo(
    // accessible: hide offerings the current user cannot order (e.g. restricted
    // to roles they do not hold) from the marketplace catalog. They remain
    // reachable from an existing resource via the offering detail page.
    () => ({ ...baseFilter, ...filter, accessible: true }),
    [baseFilter, filter],
  );

  const props = useTable({
    table: 'PublicOfferingsList',
    syncFiltersToURL: true,
    filter: mergedFilter,
    fetchData: createFetcher(marketplacePublicOfferingsList),
    queryField: 'keyword',
    mandatoryFields,
  });

  const columns: Column<PublicOfferingDetails>[] = [
    {
      title: translate('Name'),
      render: ({ row }: { row: PublicOfferingDetails }) => (
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
      gridSize={getOfferingGridSize(resolvedVariant)}
      gridItem={({ row }) => (
        <OfferingCard
          offering={row}
          variant={resolvedVariant}
          onTagClick={onTagClick}
        />
      )}
      hoverShadow={{ grid: false }}
      formId={OFFERINGS_FILTER_FORM_ID}
      filters={
        <OfferingsListFilter
          showCategory={showCategory}
          showOrganization={showOrganization}
        />
      }
      initialSorting={{ field: 'created', mode: 'desc' }}
      initialMode={initialMode === 'table' ? 'table' : 'grid'}
      showPageSizeSelector={true}
      title={translate('Offerings')}
      rowActions={RowActions}
      hasOptionalColumns
    />
  );
};
