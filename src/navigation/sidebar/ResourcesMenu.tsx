import classNames from 'classnames';
import { useContext, useEffect, useMemo } from 'react';
import {
  Accordion,
  AccordionContext,
  useAccordionButton,
} from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import { Arr082 } from '@waldur/core/svg/Arr082';
import { translate } from '@waldur/i18n';
import { getCustomer, getProject } from '@waldur/workspace/selectors';

import { MenuItem } from './MenuItem';
import { MenuSection } from './MenuSection';
import { getCategoriesSelector, sidebarInitStart } from './store';

const MAX_COLLAPSE_MENU_COUNT = 5;

const RenderMenuItems = ({ items, project }) => (
  <>
    {items.map((item) =>
      project ? (
        <MenuItem
          key={item.uuid}
          title={item.title}
          badge={`(${item.offering_count})`}
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
          badge={`(${item.offering_count})`}
          state="profile.no-project"
        />
      ),
    )}
  </>
);

const CustomToggle = ({ eventKey, itemsCount, badge }) => {
  const { activeEventKey } = useContext(AccordionContext);
  const decoratedOnClick = useAccordionButton(eventKey);

  const isCurrentEventKey = activeEventKey === eventKey;

  return (
    <div
      className="menu-item"
      data-kt-menu-trigger="trigger"
      onClick={decoratedOnClick}
    >
      <span className="menu-link">
        <span className="menu-title">
          <a
            className={classNames(
              'btn btn-flex btn-color-success fs-base p-0 ms-2 mb-2 collapsible rotate collapsed',
              isCurrentEventKey && 'active',
            )}
          >
            <span>
              {isCurrentEventKey
                ? translate('Show less')
                : translate('Show {count} more', { count: itemsCount })}
            </span>
            <Arr082 className="svg-icon ms-2 svg-icon-3 rotate-180" />
          </a>
        </span>
        {!isCurrentEventKey && <span className="menu-badge">{badge}</span>}
      </span>
    </div>
  );
};

export const ResourcesMenu = () => {
  const value = useSelector(getCategoriesSelector);
  const currentCustomer = useSelector(getCustomer);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(sidebarInitStart());
  }, [currentCustomer]);
  const project = useSelector(getProject);

  const [allOfferingsCount, collapsedOfferingsCount] = useMemo(() => {
    if (!value || value.length === 0) return [0, 0];
    const all = value.reduce(
      (acc, category) => acc + category.offering_count,
      0,
    );
    const collapsed = value
      .slice(MAX_COLLAPSE_MENU_COUNT)
      .reduce((acc, category) => acc + category.offering_count, 0);
    return [all, collapsed];
  }, [value]);

  return value ? (
    <>
      <MenuSection title={translate('Resources')} />
      {project && (
        <MenuItem
          title={translate('All resources')}
          badge={`(${allOfferingsCount})`}
          state="marketplace-project-resources-all"
          params={{
            uuid: project.uuid,
          }}
        />
      )}
      <RenderMenuItems
        items={value.slice(0, MAX_COLLAPSE_MENU_COUNT)}
        project={project}
      />
      {value.length > MAX_COLLAPSE_MENU_COUNT ? (
        <Accordion>
          <Accordion.Collapse eventKey="0">
            <RenderMenuItems
              items={value.slice(MAX_COLLAPSE_MENU_COUNT)}
              project={project}
            />
          </Accordion.Collapse>
          <CustomToggle
            eventKey="0"
            itemsCount={value.slice(MAX_COLLAPSE_MENU_COUNT).length}
            badge={`(${collapsedOfferingsCount})`}
          />
        </Accordion>
      ) : null}
    </>
  ) : null;
};
