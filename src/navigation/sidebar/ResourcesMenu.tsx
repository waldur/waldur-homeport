import { SquaresFourIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  marketplaceGlobalCategoriesRetrieve,
  MarketplaceGlobalCategoriesRetrieveData,
} from 'waldur-js-client';

import {
  SidebarMenuAccordion,
  SidebarMenuTree,
  SidebarMenuTreeItem,
} from 'waldur-ui';

import { SHORT_STALE_TIME } from '@/core/constants';
import { translate } from '@/i18n';
import { getGroupedCategories } from '@/marketplace/category/utils';
import { getCategoryGroups } from '@/marketplace/common/api';
import { ALL_RESOURCES_TABLE_ID } from '@/marketplace/resources/list/constants';
import { selectFiltersStorage } from '@/table/selectors';
import { getCustomer, getProject, getResource } from '@/workspace/selectors';

import { isDescendantOf } from '../useTabs';

import { MenuItem } from './MenuItem';
import { ResourcesMenuFilterButton } from './resources-filter/ResourcesMenuFilterButton';
import { ResourcesMenuFilters } from './resources-filter/ResourcesMenuFilters';
import { useOfferingCategories } from './utils';

const MAX_COLLAPSE_MENU_COUNT = 5;

interface CategoryGroupNode {
  uuid: string;
  title?: string;
  resource_count?: number;
  categories?: CategoryGroupNode[];
}

/** category-group tree -> SidebarMenuTree's generic {id, title, badge,
 * children} shape. Recursive to match ResourcesMenu's own data (a
 * category-with-sub-categories isn't exercised by today's data, but
 * SidebarMenuTree itself supports arbitrary depth, so this stays
 * recursive rather than assuming one level). */
const toTreeItems = (nodes: CategoryGroupNode[]): SidebarMenuTreeItem[] =>
  nodes.map((node) => ({
    id: node.uuid,
    title: node.title,
    badge: node.resource_count,
    children: node.categories?.length
      ? toTreeItems(node.categories)
      : undefined,
  }));

interface ResourcesMenuProps {
  user;
  disabled?: boolean;
  disabledTooltip?: string;
  /** Threaded from UnifiedSidebar's own top-level useExclusiveOpen — this
   * accordion competes with CallPublicMenu's for "only one open at a
   * time" at the sidebar's top level. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const ResourcesMenu = ({
  user,
  disabled,
  disabledTooltip,
  open,
  onOpenChange,
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
  const resource = useSelector(getResource);

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

  const sortedCategoryGroups = useMemo(() => {
    if (!categories) return [];
    const _categories = categories.map((category) => ({
      ...category,
      resource_count: Number(counters[category.uuid]) || 0,
    }));

    const groupedCategories = getGroupedCategories(_categories, categoryGroups);

    if (!counters) return groupedCategories;

    return [...groupedCategories].sort((a, b) => {
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

  const treeItems = useMemo(
    () => toTreeItems(sortedCategoryGroups),
    [sortedCategoryGroups],
  );

  return sortedCategoryGroups ? (
    <SidebarMenuAccordion
      // Purely for waldur-integration-testing's Sidebar page object
      // (tests/pages/sidebar.py), which locates this specific accordion
      // by id — no styling or app logic reads it.
      id="resources-menu"
      title={translate('Resources')}
      icon={<SquaresFourIcon weight="bold" />}
      badge={<ResourcesMenuFilterButton />}
      disabled={disabled}
      disabledTooltip={disabledTooltip}
      open={open}
      onOpenChange={onOpenChange}
    >
      <ResourcesMenuFilters />
      <MenuItem
        title={translate('All resources')}
        badge={allResourcesCount}
        state="all-resources"
        params={filterParams}
      />

      <SidebarMenuTree
        items={treeItems}
        maxVisibleItems={MAX_COLLAPSE_MENU_COUNT}
        moreTooltip={() =>
          translate('{count} More resources', {
            count: collapsedResourcesCount,
          })
        }
        moreLabel={(hiddenCount) =>
          translate('Show {count} more', { count: hiddenCount })
        }
        lessLabel={translate('Show less')}
        renderItem={(item) => (
          <MenuItem
            title={item.title}
            badge={item.badge}
            state="category-resources"
            params={{
              category_uuid: item.id,
              ...filterParams,
            }}
            activeState={
              state.name === 'marketplace-resource-details' &&
              resource?.category_uuid === item.id
                ? state.name
                : undefined
            }
          />
        )}
      />
    </SidebarMenuAccordion>
  ) : null;
};
