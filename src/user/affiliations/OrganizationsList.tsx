import { useSelector } from 'react-redux';

import { usePermissionView } from '@waldur/auth/PermissionLayout';
import { translate } from '@waldur/i18n';
import {
  getUser,
  isStaffOrSupport as isStaffOrSupportSelector,
} from '@waldur/workspace/selectors';

import { BaseOrganizationsList } from './BaseOrganizationsList';

export const OrganizationsList = () => {
  const isStaffOrSupport = useSelector(isStaffOrSupportSelector);
  const user = useSelector(getUser);
  usePermissionView(() => {
    if (isStaffOrSupport) {
      return {
        permission: 'limited',
        banner: {
          title: '',
          message: translate('Your role allows to see all organizations'),
        },
      };
    } else {
      return null;
    }
  }, [isStaffOrSupport]);
  return <BaseOrganizationsList user={user} />;
};
