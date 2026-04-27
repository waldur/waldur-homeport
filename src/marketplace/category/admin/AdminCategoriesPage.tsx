import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FunctionComponent } from 'react';
import {
  marketplaceCategoriesList,
  MarketplaceCategoriesListData,
} from 'waldur-js-client';

import Avatar from '@/core/Avatar';
import { FAST_STALE_TIME } from '@/core/constants';
import { Link } from '@/core/Link';
import { truncate } from '@/core/utils';
import { translate } from '@/i18n';
import { getCategoryGroups } from '@/marketplace/common/api';
import { CategoryLink } from '@/marketplace/links/CategoryLink';
import { Category } from '@/marketplace/types';
import { createFetcher } from '@/table/api';
import { CompactActionButton } from '@/table/CompactActionButton';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

import { CategoryCreateButton } from './CategoryCreateButton';
import { CategoryRowActions } from './CategoryRowActions';

const categoryFields: MarketplaceCategoriesListData['query'] = {
  field: [
    'uuid',
    'title',
    'description',
    'icon',
    'offering_count',
    'group',
    'url',
  ],
};

export const AdminCategoriesPage: FunctionComponent = () => {
  const {
    data: categoryGroups,
    isLoading: loadingGroups,
    error: errorGroups,
    refetch,
  } = useQuery({
    queryKey: ['MarketplaceCategoryGroups'],
    queryFn: () => getCategoryGroups(),
    staleTime: FAST_STALE_TIME,
  });

  const tableProps = useTable({
    table: 'CategoriesList',
    fetchData: createFetcher(marketplaceCategoriesList),
    queryField: 'title',
    filter: categoryFields,
  });

  return (
    <Table<Category>
      {...tableProps}
      columns={[
        {
          title: translate('Title'),
          render: ({ row }) => (
            <>
              <div className="d-inline-block align-middle me-2">
                <Avatar name={row.title} src={row.icon} circle />
              </div>
              <CategoryLink item={row}>{row.title}</CategoryLink>
            </>
          ),
        },
        {
          title: translate('Group'),
          render: ({ row }) => {
            if (row.group) {
              if (loadingGroups) {
                return (
                  <span className="svg-icon svg-icon-4 animation-spin me-2">
                    <ArrowsClockwiseIcon weight="bold" />
                  </span>
                );
              } else if (errorGroups) {
                return (
                  <>
                    <span className="text-danger">
                      {translate('Error in fetching groups')}
                    </span>
                    <CompactActionButton
                      action={() => refetch()}
                      iconNode={<ArrowsClockwiseIcon weight="bold" />}
                      variant="secondary"
                      className="ms-1"
                    />
                  </>
                );
              }
              const group = categoryGroups.find((g) => g.url === row.group);
              return group ? (
                <Link
                  state="public.marketplace-category-group"
                  params={{ group_uuid: group.uuid }}
                >
                  {group.title}
                </Link>
              ) : (
                <span className="text-warning fw-bold">
                  {translate('Unknown group')}
                </span>
              );
            } else {
              return <i>{translate('No group')}</i>;
            }
          },
        },
        {
          title: translate('Offerings count'),
          render: ({ row }) => <>{row.offering_count}</>,
        },
        {
          title: translate('Description'),
          render: ({ row }) => <>{truncate(row.description, 60)}</>,
        },
      ]}
      verboseName={translate('Categories')}
      initialSorting={{ field: 'title', mode: 'desc' }}
      rowActions={({ row }) => (
        <CategoryRowActions row={row} refetch={tableProps.fetch} />
      )}
      hasQuery={true}
      tableActions={<CategoryCreateButton refetch={tableProps.fetch} />}
    />
  );
};
