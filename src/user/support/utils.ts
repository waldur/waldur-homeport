import { duration } from 'moment-timezone';

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
  } else if (user.registration_method === 'saml2') {
    return 'SAML2';
  } else {
    return titleCase(user.registration_method);
  }
};

export const formatLifetime = input => {
  const time = duration(input, 'seconds');
  const hours = time.hours();
  const minutes = time.minutes();
  const seconds = time.seconds();

  if (input === null || input === 0) {
    return translate('token will not timeout');
  }
  if (hours === 0 && minutes === 0) {
    return `${seconds} sec`;
  }
  if (hours === 0 && minutes !== 0) {
    return `${minutes} min`;
  }
  if (hours !== 0) {
    return minutes !== 0 ? `${hours} h ${minutes} min` : `${hours} h`;
  }
};
