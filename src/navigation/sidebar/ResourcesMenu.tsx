import { CaretDown, SquaresFour } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import classNames from 'classnames';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { getCategories } from '@waldur/marketplace/common/api';
import { ANONYMOUS_CONFIG } from '@waldur/table/api';
import { getResource } from '@waldur/workspace/selectors';

import { getGlobalCounters } from '../workspace/api';

import { MenuAccordion } from './MenuAccordion';
import { MenuItem } from './MenuItem';

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
          <CaretDown weight="bold" />
        </span>
      </span>
    </span>
  </div>
);

const RenderMenuItems = ({ items, counters = {} }) => {
  const { state } = useCurrentStateAndParams();
  const resource = useSelector(getResource);
  return (
    <>
      {items.map((item) => (
        <MenuItem
          key={item.uuid}
          title={item.title}
          badge={counters[item.uuid]}
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
      ))}
    </>
  );
};

export const useOfferingCategories = (anonymous = false) => {
  const { data: categories } = useQuery(
    ['ResourcesMenu', 'Categories'],
    () =>
      getCategories({
        params: {
          field: ['uuid', 'title'],
          has_offerings: true,
        },
        ...(anonymous ? ANONYMOUS_CONFIG : {}),
      }),
    { refetchOnWindowFocus: false },
  );
  return categories;
};

export const ResourcesMenu = ({ anonymous = false, user }) => {
  const categories = useOfferingCategories(anonymous);
  // We will clean counters on impersonation (on change user)
  const { data: counters = {} } = useQuery(
    ['ResourcesMenu', 'Counters', user?.uuid],
    getGlobalCounters,
    { refetchOnWindowFocus: false },
  );
  const [expanded, setExpanded] = useState(false);

  const sortedCategories = useMemo(() => {
    if (!categories) return [];
    if (!counters) {
      return categories;
    }
    return categories.sort((a, b) => {
      const aCount = counters[a.uuid] || 0;
      const bCount = counters[b.uuid] || 0;
      return bCount - aCount;
    });
  }, [categories, counters]);

  const [allResourcesCount, collapsedResourcesCount] = useMemo(() => {
    if (!counters) return [0, 0];
    const all = sortedCategories.reduce(
      (acc, category) => (acc += counters[category.uuid] || 0),
      0,
    );
    const collapsed = sortedCategories
      .slice(MAX_COLLAPSE_MENU_COUNT)
      .reduce((acc, category) => (acc += counters[category.uuid] || 0), 0);
    return [all, collapsed];
  }, [sortedCategories, counters]);

  return sortedCategories ? (
    <MenuAccordion
      title={translate('Resources')}
      itemId="resources-menu"
      icon={<SquaresFour weight="bold" />}
    >
      <MenuItem
        title={translate('All resources')}
        badge={allResourcesCount}
        state="all-resources"
      />

      <RenderMenuItems
        items={sortedCategories.slice(0, MAX_COLLAPSE_MENU_COUNT)}
        counters={counters}
      />
      {sortedCategories.length > MAX_COLLAPSE_MENU_COUNT ? (
        <>
          {expanded && (
            <RenderMenuItems
              items={sortedCategories.slice(MAX_COLLAPSE_MENU_COUNT)}
              counters={counters}
            />
          )}
          <CustomToggle
            itemsCount={sortedCategories.slice(MAX_COLLAPSE_MENU_COUNT).length}
            moreResourcesCount={collapsedResourcesCount}
            onClick={() => setExpanded(!expanded)}
            expanded={expanded}
          />
        </>
      ) : null}
    </MenuAccordion>
  ) : null;
};
