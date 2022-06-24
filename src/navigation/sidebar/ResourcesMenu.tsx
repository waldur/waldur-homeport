import { Arr082 } from '@waldur/core/svg/Arr082';
import classNames from 'classnames';
import { useContext, useEffect } from 'react';
import {
  Accordion,
  AccordionContext,
  useAccordionButton,
} from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { getProject } from '@waldur/workspace/selectors';

import { MenuItem } from './MenuItem';
import { MenuSection } from './MenuSection';
import { getCategoriesSelector, sidebarInitStart } from './store';

const MAX_COLLAPSE_MENU_COUNT = 5;

const RenderMenuItems = (items, project) =>
  items.map((item) =>
    project ? (
      <MenuItem
        key={item.uuid}
        title={item.title}
        state="marketplace-project-resources"
        params={{
          uuid: project.uuid,
          category_uuid: item.uuid,
        }}
      />
    ) : (
      <MenuItem key={item.uuid} title={item.title} state="profile.no-project" />
    ),
  );

const CustomToggle = ({ eventKey, itemsCount }) => {
  const { activeEventKey } = useContext(AccordionContext);
  const decoratedOnClick = useAccordionButton(eventKey);

  const isCurrentEventKey = activeEventKey === eventKey;

  return (
    <div className="menu-item" onClick={decoratedOnClick}>
      <div className="menu-content">
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
      </div>
    </div>
  );
};

export const ResourcesMenu = () => {
  const value = useSelector(getCategoriesSelector);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(sidebarInitStart());
  });
  const project = useSelector(getProject);
  return value ? (
    <>
      <MenuSection title={translate('Resources')} />
      {RenderMenuItems(value.slice(0, MAX_COLLAPSE_MENU_COUNT), project)}
      <Accordion>
        <Accordion.Collapse eventKey="0">
          <>{RenderMenuItems(value.slice(MAX_COLLAPSE_MENU_COUNT), project)}</>
        </Accordion.Collapse>
        <CustomToggle
          eventKey="0"
          itemsCount={value.slice(MAX_COLLAPSE_MENU_COUNT).length}
        />
      </Accordion>
    </>
  ) : null;
};
