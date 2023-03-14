import { useCurrentStateAndParams } from '@uirouter/react';
import classNames from 'classnames';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAsync, useEffectOnce } from 'react-use';

import { Arr082 } from '@waldur/core/svg/Arr082';
import { translate } from '@waldur/i18n';
import {
  getCustomer,
  getProject,
  getResource,
} from '@waldur/workspace/selectors';

import { getOrganizationCounters, getProjectCounters } from '../workspace/api';

import { MenuAccordion } from './MenuAccordion';
import { MenuItem } from './MenuItem';
import { getCategoriesSelector, sidebarInitStart } from './store';

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
  const categories: any[] = useSelector(getCategoriesSelector);
  const dispatch = useDispatch();
  useEffectOnce(() => {
    dispatch(sidebarInitStart(anonymous));
  });
  const project = useSelector(getProject);

  const [preferredCounters, setPreferredCounters] = useState({});
  const [expanded, setExpanded] = useState(false);

  const { value: projectCounters } = useAsync(() => {
    if (!project) return Promise.resolve({});
    return getProjectCounters(project.uuid);
  }, [project]);

  const { value: organizationCounters } = useAsync(() => {
    if (!currentCustomer) return Promise.resolve({});
    return getOrganizationCounters(currentCustomer.uuid);
  }, [currentCustomer]);

  useEffect(() => {
    if (Object.keys(projectCounters || {}).length > 0) {
      setPreferredCounters(projectCounters);
    } else {
      setPreferredCounters(organizationCounters || {});
    }
  }, [projectCounters, organizationCounters]);

  const sortedCategories = useMemo(() => {
    if (!categories) return [];
    if (!preferredCounters) {
      return categories;
    }
    return categories.sort((a, b) => {
      const aCount = preferredCounters['marketplace_category_' + a.uuid] || 0;
      const bCount = preferredCounters['marketplace_category_' + b.uuid] || 0;
      return bCount - aCount;
    });
  }, [categories, preferredCounters]);

  const [allResourcesCount, collapsedResourcesCount] = useMemo(() => {
    if (!preferredCounters) return [0, 0];
    const all = sortedCategories.reduce(
      (acc, category) =>
        (acc +=
          preferredCounters['marketplace_category_' + category.uuid] || 0),
      0,
    );
    const collapsed = sortedCategories
      .slice(MAX_COLLAPSE_MENU_COUNT)
      .reduce(
        (acc, category) =>
          (acc +=
            preferredCounters['marketplace_category_' + category.uuid] || 0),
        0,
      );
    return [all, collapsed];
  }, [sortedCategories, preferredCounters]);

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
        counters={preferredCounters}
      />
      {sortedCategories.length > MAX_COLLAPSE_MENU_COUNT ? (
        <>
          {expanded && (
            <RenderMenuItems
              items={sortedCategories.slice(MAX_COLLAPSE_MENU_COUNT)}
              project={project}
              counters={preferredCounters}
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
