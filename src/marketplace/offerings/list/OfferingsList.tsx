import { TextColumnsIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import {
  marketplaceProviderOfferingsList,
  MarketplaceProviderOfferingsListData,
  ProviderOfferingDetails,
} from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { getLabel, getOfferingTypes } from '@/marketplace/common/registry';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { createFetcher } from '@/table/api';
import { BooleanField } from '@/table/BooleanField';
import { SLUG_COLUMN } from '@/table/slug';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';
import { useUser } from '@/workspace/hooks';

import { useOfferingDropdownActions } from '../hooks';

import { CreateOfferingButton } from './CreateOfferingButton';
import { OfferingActions } from './OfferingActions';
import { OfferingNameColumn } from './OfferingNameColumn';
import { OfferingStateCell } from './OfferingStateCell';
import { getStates } from './OfferingStateFilter';

const ArticleCodeUpdateDialog = lazyComponent(() =>
  import('../article-codes/ArticleCodeUpdateDialog').then((module) => ({
    default: module.ArticleCodeUpdateDialog,
  })),
);

const mandatoryFields: MarketplaceProviderOfferingsListData['query']['field'] =
  ['customer_uuid', 'components', 'plans'];

export const BaseOfferingsList: FunctionComponent<{
  table: string;
  filter: MarketplaceProviderOfferingsListData['query'];
  hasOrganizationColumn?: boolean;
  showActions?: boolean;
  showProvider?: boolean;
  filters?;
}> = ({
  table,
  filter,
  hasOrganizationColumn,
  showActions,
  showProvider,
  filters,
}) => {
  const props = useTable({
    table,
    filter,
    fetchData: createFetcher(marketplaceProviderOfferingsList),
    queryField: 'keyword',
    mandatoryFields,
  });

  const organizationColumn: Column<ProviderOfferingDetails>[] =
    hasOrganizationColumn
      ? [
          {
            title: translate('Organization'),
            render: ({ row }) => renderFieldOrDash(row.customer_name),
            filter: 'organization',
            inlineFilter: (row) => ({
              name: row.customer_name,
              uuid: row.customer_uuid,
            }),
            export: 'customer_name',
            keys: ['customer_name'],
            id: 'organization',
          },
        ]
      : [];

  const columns: Column<ProviderOfferingDetails>[] = [
    {
      title: translate('Name'),
      render: OfferingNameColumn,
      orderField: 'name',
      export: 'name',
      keys: ['name'],
      id: 'name',
    },
    ...organizationColumn,
    {
      title: translate('Category'),
      render: ({ row }) => <>{row.category_title}</>,
      filter: 'category',
      inlineFilter: (row) => ({
        uuid: row.category_uuid,
        title: row.category_title,
      }),
      export: 'category_title',
      keys: ['category_title'],
      id: 'category',
    },
    {
      title: translate('Created'),
      render: ({ row }) => <>{formatDateTime(row.created)}</>,
      orderField: 'created',
      export: (row) => formatDateTime(row.created),
      exportKeys: ['created'],
      keys: ['created'],
      id: 'created',
    },
    {
      title: translate('State'),
      render: OfferingStateCell,
      filter: 'state',
      inlineFilter: (row) => getStates().filter((op) => op.value === row.state),
      export: 'state',
      keys: ['state'],
      id: 'state',
    },
    {
      title: translate('Type'),
      render: ({ row }) => <>{getLabel(row.type)}</>,
      filter: 'offering_type',
      inlineFilter: (row) =>
        getOfferingTypes().find((op) => op.value === row.type),
      export: (row) => getLabel(row.type),
      exportKeys: ['type'],
      keys: ['type'],
      id: 'type',
    },
    {
      title: translate('Shared'),
      render: ({ row }) => <BooleanField value={row.shared} />,
      id: 'shared',
      filter: 'shared',
      keys: ['shared'],
      optional: true,
    },
    SLUG_COLUMN as Column<ProviderOfferingDetails>,
  ];

  const { openDialog } = useModal();
  const user = useUser();
  const providerDropdownActions = useOfferingDropdownActions(props.fetch);

  const dropdownActions = [
    ...(providerDropdownActions || []),
    ...(user?.is_staff
      ? [
          <ActionItem
            key="update-article-codes"
            title={translate('Update article codes')}
            action={() => {
              openDialog(ArticleCodeUpdateDialog, {
                resolve: { refetch: props.fetch },
                size: 'xl',
              });
            }}
            iconNode={<TextColumnsIcon weight="bold" />}
            staff
          />,
        ]
      : []),
  ];

  return (
    <Table
      {...props}
      placeholderActions={
        showActions && <CreateOfferingButton className="w-175px mw-350px" />
      }
      tableActions={
        showActions && (
          <CreateOfferingButton
            showProvider={showProvider}
            fetch={props.fetch}
          />
        )
      }
      columns={columns}
      verboseName={translate('Offerings')}
      dropdownActions={dropdownActions.length > 0 ? dropdownActions : undefined}
      initialSorting={{ field: 'created', mode: 'desc' }}
      enableExport={true}
      rowActions={
        showActions
          ? ({ row }) => <OfferingActions row={row} refetch={props.fetch} />
          : null
      }
      hasQuery={true}
      filters={filters}
      hasOptionalColumns
    />
  );
};
