import { CaretDownIcon, SquaresFourIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import classNames from 'classnames';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  marketplaceGlobalCategoriesRetrieve,
  MarketplaceGlobalCategoriesRetrieveData,
} from 'waldur-js-client';

import { SHORT_STALE_TIME } from '@/core/constants';
import { translate } from '@/i18n';
import { getGroupedCategories } from '@/marketplace/category/utils';
import { getCategoryGroups } from '@/marketplace/common/api';
import { ALL_RESOURCES_TABLE_ID } from '@/marketplace/resources/list/constants';
import { selectFiltersStorage } from '@/table/selectors';
import { getCustomer, getProject, getResource } from '@/workspace/selectors';

import { isDescendantOf } from '../useTabs';

import { MenuAccordion } from './MenuAccordion';
import { MenuItem } from './MenuItem';
import { ResourcesMenuFilterButton } from './resources-filter/ResourcesMenuFilterButton';
import { ResourcesMenuFilters } from './resources-filter/ResourcesMenuFilters';
import { useOfferingCategories } from './utils';

const MAX_COLLAPSE_MENU_COUNT = 5;

const CustomToggle = ({
  onClick,
  itemsCount,
  moreResourcesCount,
  expanded,
}) => (
  <div
    className={classNames('menu-item menu-show-more', expanded && 'active')}
    data-kt-menu-trigger="trigger"
    aria-hidden="true"
    onClick={onClick}
  >
    <span
      className="menu-link"
      title={
        !expanded
          ? translate('{count} More resources', { count: moreResourcesCount })
          : null
      }
    >
      <span className="menu-bullet" />
      <span className="menu-title">
        <div className="btn btn-flex btn-color-primary-300 p-0 collapsible collapsed">
          <span>
            {expanded
              ? translate('Show less')
              : translate('Show {count} more', { count: itemsCount })}
          </span>
        </div>
      </span>
      <span className={classNames('menu-badge rotate', expanded && 'active')}>
        <span className="svg-icon svg-icon-3 svg-icon-primary-300 rotate-180">
          <CaretDownIcon weight="bold" />
        </span>
      </span>
    </span>
  </div>
);

interface RenderMenuItemsProps {
  items: Array<{
    uuid?: string;
    title?: string;
    resource_count?: number;
    categories?: Array<any>;
  }>;
  filterParams?: Record<string, string | undefined>;
}

const RenderMenuItems = ({ items, filterParams }: RenderMenuItemsProps) => {
  const { state } = useCurrentStateAndParams();
  const resource = useSelector(getResource);
  return (
    <>
      {items.map((item) =>
        !item.categories?.length ? (
          <MenuItem
            key={item.uuid}
            title={item.title}
            badge={item.resource_count}
            state="category-resources"
            params={{
              category_uuid: item.uuid,
              ...filterParams,
            }}
            activeState={
              state.name === 'marketplace-resource-details' &&
              resource?.category_uuid === item.uuid
                ? state.name
                : undefined
            }
          />
        ) : (
          <MenuAccordion
            key={item.uuid}
            title={item.title}
            itemId={item.uuid}
            child
            badge={
              <span className="badge badge-pill">{item.resource_count}</span>
            }
          >
            <RenderMenuItems
              items={item.categories}
              filterParams={filterParams}
            />
          </MenuAccordion>
        ),
      )}
    </>
  );
};

interface ResourcesMenuProps {
  user;
  disabled?: boolean;
  disabledTooltip?: string;
}

export const ResourcesMenu = ({
  user,
  disabled,
  disabledTooltip,
}: ResourcesMenuProps) => {
  const categories = useOfferingCategories();

  const { data: categoryGroups } = useQuery({
    queryKey: ['MarketplaceCategoryGroups'],
    queryFn: () => getCategoryGroups({ field: ['uuid', 'title', 'url'] }),
    staleTime: SHORT_STALE_TIME,
  });

  const resourcesFilters = useSelector((state: any) =>
    selectFiltersStorage(state, ALL_RESOURCES_TABLE_ID),
  );
  const workspaceProject = useSelector(getProject);
  const workspaceCustomer = useSelector(getCustomer);

  const { state } = useCurrentStateAndParams();
  const isProjectContext = useMemo(
    () => isDescendantOf('project', state),
    [state],
  );
  const isCustomerContext = useMemo(
    () =>
      isDescendantOf('organization', state) ||
      isDescendantOf('call-management', state) ||
      isDescendantOf('marketplace-provider', state),
    [state],
  );

  // Resolve project/customer to scope sidebar links by, preferring the active
  // workspace (project detail / organization detail page) over whatever is
  // persisted in the resources-filter storage. Without this, clicking
  // "Virtual machines" while inside a project drops the project filter.
  const scope = useMemo(() => {
    const storedProject = resourcesFilters?.find(
      (item) => item.name === 'project',
    )?.value;
    const storedCustomer = resourcesFilters?.find(
      (item) => item.name === 'organization',
    )?.value;
    return {
      project: isProjectContext
        ? (workspaceProject ?? storedProject)
        : storedProject,
      customer:
        isProjectContext || isCustomerContext
          ? (workspaceCustomer ??
            (workspaceProject as any)?.customer ??
            storedCustomer)
          : storedCustomer,
    };
  }, [
    resourcesFilters,
    workspaceProject,
    workspaceCustomer,
    isProjectContext,
    isCustomerContext,
  ]);

  // Encoded as "uuid::name" to match the compact format produced by
  // src/core/filters.ts (compactFilterValue); AllResourcesList /
  // CategoryResourcesList expand these back to {uuid, name} on mount.
  const filterParams = useMemo(() => {
    const encode = (entity?: { uuid?: string; name?: string }) =>
      entity?.uuid ? `${entity.uuid}::${entity.name ?? ''}` : undefined;
    return {
      project: encode(scope.project as any),
      organization: encode(scope.customer as any),
    };
  }, [scope]);

  const query = useMemo(
    () =>
      ({
        project_uuid: (scope.project as any)?.uuid,
        customer_uuid: (scope.customer as any)?.uuid,
      }) satisfies MarketplaceGlobalCategoriesRetrieveData['query'],
    [scope],
  );

  // We will clean counters on impersonation (on change user)
  const { data: counters = {} } = useQuery({
    queryKey: [
      'ResourcesMenu',
      'Counters',
      user?.uuid,
      query?.customer_uuid,
      query?.project_uuid,
    ],

    queryFn: () =>
      marketplaceGlobalCategoriesRetrieve({ query }).then(
        (response) => response.data,
      ),

    refetchOnWindowFocus: false,
  });
  const [expanded, setExpanded] = useState(false);

  const sortedCategoryGroups = useMemo(() => {
    if (!categories) return [];
    const _categories = categories.map((category) => {
      category['resource_count'] = counters[category.uuid] || 0;
      return category;
    });

    const groupedCategories = getGroupedCategories(_categories, categoryGroups);

    if (!counters) return groupedCategories;

    return groupedCategories.sort((a, b) => {
      const aCount = Number(counters[a.uuid]) || 0;
      const bCount = Number(counters[b.uuid]) || 0;
      return bCount - aCount;
    });
  }, [categories, categoryGroups, counters]);

  const [allResourcesCount, collapsedResourcesCount] = useMemo(() => {
    if (!counters) return [0, 0];
    const all = sortedCategoryGroups.reduce(
      (acc, category) => (acc += category.resource_count || 0),
      0,
    );
    const collapsed = sortedCategoryGroups
      .slice(MAX_COLLAPSE_MENU_COUNT)
      .reduce((acc, category) => (acc += category.resource_count || 0), 0);
    return [all, collapsed];
  }, [sortedCategoryGroups, counters]);

  return sortedCategoryGroups ? (
    <MenuAccordion
      title={translate('Resources')}
      itemId="resources-menu"
      icon={<SquaresFourIcon weight="bold" />}
      badge={<ResourcesMenuFilterButton />}
      disabled={disabled}
      disabledTooltip={disabledTooltip}
    >
      <ResourcesMenuFilters />
      <MenuItem
        title={translate('All resources')}
        badge={allResourcesCount}
        state="all-resources"
        params={filterParams}
      />

      <RenderMenuItems
        items={sortedCategoryGroups.slice(0, MAX_COLLAPSE_MENU_COUNT)}
        filterParams={filterParams}
      />

      {sortedCategoryGroups.length > MAX_COLLAPSE_MENU_COUNT ? (
        <>
          {expanded && (
            <RenderMenuItems
              items={sortedCategoryGroups.slice(MAX_COLLAPSE_MENU_COUNT)}
              filterParams={filterParams}
            />
          )}
          <CustomToggle
            itemsCount={
              sortedCategoryGroups.slice(MAX_COLLAPSE_MENU_COUNT).length
            }
            moreResourcesCount={collapsedResourcesCount}
            onClick={() => setExpanded(!expanded)}
            expanded={expanded}
          />
        </>
      ) : null}
    </MenuAccordion>
  ) : null;
};
