import { useSelector } from 'react-redux';
import { useAsync } from 'react-use';

import { translate } from '@waldur/i18n';
import { getCategories } from '@waldur/marketplace/common/api';
import { getProject } from '@waldur/workspace/selectors';

import { MenuItem } from './MenuItem';
import { MenuSection } from './MenuSection';

export const ResourcesMenu = () => {
  const { value } = useAsync(() =>
    getCategories({
      params: {
        field: ['uuid', 'title'],
        has_offerings: true,
      },
    }),
  );
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
