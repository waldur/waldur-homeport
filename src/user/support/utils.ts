import { translate } from '@waldur/i18n';

export const formatUserStatus = (user) => {
  if (!user) {
    return '—';
  }
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

export const getRoleFilterOptions = () => [
  {
    label: translate('Staff'),
    value: 'is_staff',
  },
  {
    label: translate('Support'),
    value: 'is_support',
  },
];

export const getUserStatusFilterOptions = () => [
  {
    label: translate('Active'),
    value: true,
  },
  {
    label: translate('Disabled'),
    value: false,
  },
];

export const formatUserIsActive = (user) =>
  user.is_active ? translate('Active') : translate('Disabled');
