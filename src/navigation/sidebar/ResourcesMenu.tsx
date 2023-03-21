import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import classNames from 'classnames';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { Arr082 } from '@waldur/core/svg/Arr082';
import { translate } from '@waldur/i18n';
import { getCategories } from '@waldur/marketplace/common/api';
import { ANONYMOUS_CONFIG } from '@waldur/table/api';
import {
  getCustomer,
  getProject,
  getResource,
} from '@waldur/workspace/selectors';

import { getOrganizationCounters, getProjectCounters } from '../workspace/api';

import { MenuAccordion } from './MenuAccordion';
import { MenuItem } from './MenuItem';

const Icon = require('./Resources.svg');

const MAX_COLLAPSE_MENU_COUNT = 5;

const getCounterText = (counter: number) => {
  if (counter) return `(${counter})`;
  return undefined;
};

const CustomToggle = ({ onClick, itemsCount, badge, expanded }) => (
  <div className="menu-item" data-kt-menu-trigger="trigger" onClick={onClick}>
    <span className="menu-link">
      <span className="menu-title">
        <a
          className={classNames(
            'btn btn-flex btn-color-success fs-base p-0 ms-2 mb-2 collapsible rotate collapsed',
            expanded && 'active',
          )}
        >
          <span>
            {expanded
              ? translate('Show less')
              : translate('Show {count} more', { count: itemsCount })}
          </span>
          <Arr082 className="svg-icon ms-2 svg-icon-3 rotate-180" />
        </a>
      </span>
      {!expanded && <span className="menu-badge">{badge}</span>}
    </span>
  </div>
);

const RenderMenuItems = ({ items, project, counters = {} }) => {
  const { state } = useCurrentStateAndParams();
  const resource = useSelector(getResource);
  return (
    <>
      {items.map((item) =>
        project ? (
          <MenuItem
            key={item.uuid}
            title={item.title}
            badge={getCounterText(
              counters['marketplace_category_' + item.uuid],
            )}
            state="marketplace-project-resources"
            params={{
              uuid: project.uuid,
              category_uuid: item.uuid,
            }}
            activeState={
              resource?.category_uuid === item.uuid ? state.name : undefined
            }
          />
        ) : (
          <MenuItem
            key={item.uuid}
            title={item.title}
            state="profile.no-project"
          />
        ),
      )}
    </>
  );
};

export const ResourcesMenu = ({ anonymous }) => {
  const currentCustomer = useSelector(getCustomer);
  const project = useSelector(getProject);

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

  const { data: counters = {} } = useQuery(
    ['ResourcesMenu', 'Counters', project?.uuid, currentCustomer?.uuid],
    () => {
      if (project) {
        return getProjectCounters(project.uuid);
      } else if (currentCustomer) {
        return getOrganizationCounters(currentCustomer.uuid);
      }
    },
    { refetchOnWindowFocus: false },
  );
  const [expanded, setExpanded] = useState(false);

  const sortedCategories = useMemo(() => {
    if (!categories) return [];
    if (!counters) {
      return categories;
    }
    return categories.sort((a, b) => {
      const aCount = counters['marketplace_category_' + a.uuid] || 0;
      const bCount = counters['marketplace_category_' + b.uuid] || 0;
      return bCount - aCount;
    });
  }, [categories, counters]);

  const [allResourcesCount, collapsedResourcesCount] = useMemo(() => {
    if (!counters) return [0, 0];
    const all = sortedCategories.reduce(
      (acc, category) =>
        (acc += counters['marketplace_category_' + category.uuid] || 0),
      0,
    );
    const collapsed = sortedCategories
      .slice(MAX_COLLAPSE_MENU_COUNT)
      .reduce(
        (acc, category) =>
          (acc += counters['marketplace_category_' + category.uuid] || 0),
        0,
      );
    return [all, collapsed];
  }, [sortedCategories, counters]);

  return sortedCategories ? (
    <MenuAccordion
      title={translate('Resources')}
      itemId="resources-menu"
      iconPath={Icon}
    >
      {project && (
        <MenuItem
          title={translate('All resources')}
          badge={getCounterText(allResourcesCount)}
          state="marketplace-project-resources-all"
          params={{
            uuid: project.uuid,
          }}
        />
      )}
      <RenderMenuItems
        items={sortedCategories.slice(0, MAX_COLLAPSE_MENU_COUNT)}
        project={project}
        counters={counters}
      />
      {sortedCategories.length > MAX_COLLAPSE_MENU_COUNT ? (
        <>
          {expanded && (
            <RenderMenuItems
              items={sortedCategories.slice(MAX_COLLAPSE_MENU_COUNT)}
              project={project}
              counters={counters}
            />
          )}
          <CustomToggle
            itemsCount={sortedCategories.slice(MAX_COLLAPSE_MENU_COUNT).length}
            badge={getCounterText(collapsedResourcesCount)}
            onClick={() => setExpanded(!expanded)}
            expanded={expanded}
          />
        </>
      ) : null}
    </MenuAccordion>
  ) : null;
};

ResourcesMenu.defaultProps = {
  anonymous: false,
};
