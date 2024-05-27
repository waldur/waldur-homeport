import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { usePermissionView } from '@waldur/auth/PermissionLayout';
import { translate } from '@waldur/i18n';
import {
  getUser,
  isStaffOrSupport as isStaffOrSupportSelector,
} from '@waldur/workspace/selectors';

import { BaseProjectsList } from './BaseProjectsList';
import { ProjectsListFilter } from './ProjectsListFilter';

const mapStateToFilter = createSelector(
  getFormValues('affiliationProjectsListFilter'),
  getUser,
  (stateFilter: any, user) => {
    const filter: any = {};
    if (stateFilter && stateFilter.organization) {
      filter.customer = stateFilter.organization.uuid;
    }
    filter.user_uuid = user.uuid;
    return filter;
  },
);

export const ProjectsList = () => {
  const isStaffOrSupport = useSelector(isStaffOrSupportSelector);
  usePermissionView(() => {
    if (isStaffOrSupport) {
      return {
        permission: 'limited',
        banner: {
          title: '',
          message: translate('Your role allows to see all projects'),
        },
      };
    } else {
      return null;
    }
  }, [isStaffOrSupport]);
  const filter = useSelector(mapStateToFilter);
  return (
    <BaseProjectsList
      filters={<ProjectsListFilter />}
      filter={filter}
      standalone
    />
  );
};
