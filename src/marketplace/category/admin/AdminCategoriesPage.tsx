import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useMemo } from 'react';
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
import { SelectFilter } from '@/table';
import { createFetcher } from '@/table/api';
import { CompactActionButton } from '@/table/CompactActionButton';
import Table from '@/table/Table';
import { useFilterValues } from '@/table/useFilterValues';
import { useTable } from '@/table/useTable';

import { CategoryCreateButton } from './CategoryCreateButton';
import { CategoryRowActions } from './CategoryRowActions';

const ADMIN_CATEGORIES_FILTER_FORM_ID = 'AdminCategoriesListFilter';

interface GroupOption {
  label: string;
  value: string;
}

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

const CategoriesListFilter: FunctionComponent<{ options: GroupOption[] }> = ({
  options,
}) => (
  <SelectFilter
    title={translate('Group')}
    name="group"
    badgeValue={(value: GroupOption) => value?.label}
    placeholder={translate('Select group...')}
    options={options}
    isClearable={true}
  />
);

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

  const values = useFilterValues('CategoriesList');

  const filter = useMemo<MarketplaceCategoriesListData['query']>(() => {
    const obj: MarketplaceCategoriesListData['query'] = { ...categoryFields };
    if (values?.group) {
      obj.group_uuid = values.group.value;
    }
    return obj;
  }, [values]);

  const groupOptions = useMemo<GroupOption[]>(
    () =>
      (categoryGroups || []).map((g) => ({ label: g.title, value: g.uuid })),
    [categoryGroups],
  );

  const tableProps = useTable({
    table: 'CategoriesList',
    syncFiltersToURL: true,
    fetchData: createFetcher(marketplaceCategoriesList),
    queryField: 'title',
    filter,
  });

  return (
    <Table<Category>
      {...tableProps}
      columns={[
        {
          title: translate('Title'),
          orderField: 'title',
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
          orderField: 'group__title',
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
      initialSorting={{ field: 'group__title', mode: 'asc' }}
      rowActions={({ row }) => (
        <CategoryRowActions row={row} refetch={tableProps.fetch} />
      )}
      hasQuery={true}
      tableActions={<CategoryCreateButton refetch={tableProps.fetch} />}
      filters={<CategoriesListFilter options={groupOptions} />}
      formId={ADMIN_CATEGORIES_FILTER_FORM_ID}
    />
  );
};
