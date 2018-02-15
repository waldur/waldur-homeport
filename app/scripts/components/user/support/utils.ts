import { titleCase } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';

export const formatUserStatus = user => {
  if (user.is_staff && !user.is_support) {
    return translate('Staff');
  } else if (user.is_staff && user.is_support) {
    return translate('Staff and Support user');
  } else if (!user.is_staff && user.is_support) {
    return translate('Support user');
  } else {
    return translate('Regular user');
  }
};

export const formatRegistrationMethod = user => {
  if (!user.registration_method) {
    return translate('Default');
  } else if (user.registration_method === 'openid') {
    return translate('Estonian ID');
  } else {
    return titleCase(user.registration_method);
  }
};
