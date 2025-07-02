import { CaretDownIcon, SquaresFourIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import classNames from 'classnames';
import { useMemo, useState } from 'react';
import { Badge } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import {
  marketplaceGlobalCategoriesRetrieve,
  MarketplaceGlobalCategoriesRetrieveData,
} from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { getGroupedCategories } from '@waldur/marketplace/category/utils';
import { getCategoryGroups } from '@waldur/marketplace/common/api';
import { ALL_RESOURCES_TABLE_ID } from '@waldur/marketplace/resources/list/constants';
import { selectFiltersStorage } from '@waldur/table/selectors';
import { getResource } from '@waldur/workspace/selectors';

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
          ? moreResourcesCount + ' ' + translate('More resources')
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

const RenderMenuItems = ({ items }) => {
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
              <Badge bg="" pill className="badge-inverse">
                {item.resource_count}
              </Badge>
            }
          >
            <RenderMenuItems items={item.categories} />
          </MenuAccordion>
        ),
      )}
    </>
  );
};

export const ResourcesMenu = ({ user }) => {
  const categories = useOfferingCategories();

  const { data: categoryGroups } = useQuery({
    queryKey: ['MarketplaceCategoryGroups'],
    queryFn: () => getCategoryGroups({ field: ['uuid', 'title', 'url'] }),
    staleTime: 1 * 60 * 1000,
  });

  const resourcesFilters = useSelector((state: any) =>
    selectFiltersStorage(state, ALL_RESOURCES_TABLE_ID),
  );
  const query = useMemo(() => {
    if (!resourcesFilters) return undefined;
    const project = resourcesFilters.find((item) => item.name === 'project');
    const organization = resourcesFilters.find(
      (item) => item.name === 'organization',
    );
    return {
      project_uuid: project?.value?.uuid,
      customer_uuid: organization?.value?.uuid,
    } satisfies MarketplaceGlobalCategoriesRetrieveData['query'];
  }, [resourcesFilters]);

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
      const aCount = counters[a.uuid] || 0;
      const bCount = counters[b.uuid] || 0;
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
    >
      <ResourcesMenuFilters />
      <MenuItem
        title={translate('All resources')}
        badge={allResourcesCount}
        state="all-resources"
      />

      <RenderMenuItems
        items={sortedCategoryGroups.slice(0, MAX_COLLAPSE_MENU_COUNT)}
      />

      {sortedCategoryGroups.length > MAX_COLLAPSE_MENU_COUNT ? (
        <>
          {expanded && (
            <RenderMenuItems
              items={sortedCategoryGroups.slice(MAX_COLLAPSE_MENU_COUNT)}
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
