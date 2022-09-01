import classNames from 'classnames';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAsync, useEffectOnce } from 'react-use';

import { Arr082 } from '@waldur/core/svg/Arr082';
import { translate } from '@waldur/i18n';
import { getCustomer, getProject } from '@waldur/workspace/selectors';

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

const RenderMenuItems = ({ items, project, counters = {} }) => (
  <>
    {items.map((item) =>
      project ? (
        <MenuItem
          key={item.uuid}
          title={item.title}
          badge={getCounterText(counters['marketplace_category_' + item.uuid])}
          state="marketplace-project-resources"
          params={{
            uuid: project.uuid,
            category_uuid: item.uuid,
          }}
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

export const ResourcesMenu = ({ anonymous }) => {
  const currentCustomer = useSelector(getCustomer);
  const categories = useSelector(getCategoriesSelector);
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
      setPreferredCounters(organizationCounters);
    }
  }, [projectCounters, organizationCounters]);

  const [allResourcesCount, collapsedResourcesCount] = useMemo(() => {
    if (!preferredCounters) return [0, 0];
    const all = categories.reduce(
      (acc, category) =>
        (acc +=
          preferredCounters['marketplace_category_' + category.uuid] || 0),
      0,
    );
    const collapsed = categories
      .slice(MAX_COLLAPSE_MENU_COUNT)
      .reduce(
        (acc, category) =>
          (acc +=
            preferredCounters['marketplace_category_' + category.uuid] || 0),
        0,
      );
    return [all, collapsed];
  }, [categories, preferredCounters]);

  return categories ? (
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
        items={categories.slice(0, MAX_COLLAPSE_MENU_COUNT)}
        project={project}
        counters={preferredCounters}
      />
      {categories.length > MAX_COLLAPSE_MENU_COUNT ? (
        <>
          {expanded && (
            <RenderMenuItems
              items={categories.slice(MAX_COLLAPSE_MENU_COUNT)}
              project={project}
              counters={preferredCounters}
            />
          )}
          <CustomToggle
            itemsCount={categories.slice(MAX_COLLAPSE_MENU_COUNT).length}
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
