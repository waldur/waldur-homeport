import { useSelector } from 'react-redux';

import { usePermissionView } from '@waldur/auth/PermissionLayout';
import { translate } from '@waldur/i18n';
import { isStaffOrSupport as isStaffOrSupportSelector } from '@waldur/workspace/selectors';

export const useResourcesListBanner = () => {
  const isStaffOrSupport = useSelector(isStaffOrSupportSelector);

  usePermissionView(() => {
    if (isStaffOrSupport) {
      return {
        permission: 'limited',
        banner: {
          title: '',
          message: translate('Your role allows to see all existing resources'),
        },
      };
    } else {
      return null;
    }
  }, [isStaffOrSupport]);
};
