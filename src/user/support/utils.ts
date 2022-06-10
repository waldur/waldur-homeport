import { translate } from '@waldur/i18n';

export const formatUserStatus = (user) => {
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

export const formatLifetime = (input: number) => {
  if (input === null || input === 0) {
    return translate('token will not timeout');
  }
  const minutes = Math.floor(input / 60);
  const hours = Math.floor(minutes / 60);
  const extraMinutes = minutes % 60;
  if (minutes === 0) {
    return `${input} sec`;
  } else if (hours === 0) {
    return `${minutes} min`;
  } else {
    return extraMinutes > 0 ? `${hours} h ${extraMinutes} min` : `${hours} h`;
  }
};
