import { translate } from '@waldur/i18n';

export const choices = [
  {
    label: translate('Requested'),
    value: 'requested',
  },
  {
    label: translate('Rejected'),
    value: 'rejected',
  },
  {
    label: translate('Pending'),
    value: 'pending',
  },
  {
    label: translate('Pending project start'),
    value: 'project',
  },
  {
    label: translate('Canceled'),
    value: 'canceled',
  },
  {
    label: translate('Expired'),
    value: 'expired',
  },
  {
    label: translate('Accepted'),
    value: 'accepted',
  },
];
export const formatInvitationState = (value) => {
  const choice = choices.find((choice) => choice.value === value);
  return choice ? choice.label : value;
};
