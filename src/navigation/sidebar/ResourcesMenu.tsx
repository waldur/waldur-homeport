import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { getProject } from '@waldur/workspace/selectors';

import { MenuItem } from './MenuItem';
import { MenuSection } from './MenuSection';
import { getCategoriesSelector, sidebarInitStart } from './store';

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
      {value.map((item) =>
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
          <MenuItem
            key={item.uuid}
            title={item.title}
            state="profile.no-project"
          />
        ),
      )}
    </>
  ) : null;
};
